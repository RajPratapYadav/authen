const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

class UserModel {
    async findByEmail(email) {
        return User.findOne({ email });
    }
   
    async createUser(email, password) {
        const newUser = new User({
            email,
            password,
        });
        return newUser.save();
    }
    async updatePasswordByEmail(email, hashedPassword) {
        try {
            // Update the user's password
            const result = await User.updateOne({ email: email }, { $set: { password: hashedPassword } });
    
            if (result.nModified === 1) {
                // Password updated successfully
                return true;
            } else {
                // User not found or password not updated
                console.log(`User not found or password not updated for email: ${email}`);
                return false;
            }
        } catch (error) {
            // Handle database errors
            console.error('Error updating password:', error);
            throw error; // Rethrow the error to handle it at a higher level
        }
    }
}

module.exports = UserModel;
