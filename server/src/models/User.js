/**
 * User.js
 * Mongoose model for User profile and metadata.
 */

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: '',
    },
    preferredRole: {
      type: String,
      default: 'Frontend',
    },
    targetExperience: {
      type: String,
      default: '1-3 years',
    },
    activeResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
