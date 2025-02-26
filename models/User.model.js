const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      match: /.+\@.+\..+/,
      required: [true, 'Email is required.'], // an array with state and 'error message'
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters long.']
    },
    name: {
      type: String,
      required: [true, 'Name is required.']
    },
    recipies: [{
      type: Schema.Types.ObjectId,
      ref: "Recipie"
    }] // Array of references to Recipie documents}
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
