import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    // ===============================
    // BASIC INFO
    // ===============================
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      index: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description too long"],
    },

    type: {
      type: String,
      enum: ["residential", "commercial"],
      required: [true, "Property type is required"],
    },

    transactionType: {
      type: String,
      enum: ["resale", "new"],
      required: [true, "Transaction type is required"],
    },

    // ===============================
    // PRICE
    // ===============================
    price: {
      amount: {
        type: Number,
        required: [true, "Price amount is required"],
        min: [0, "Price cannot be negative"],
      },
      currency: { type: String, default: "INR" },
    },

    // ===============================
    // LOCATION
    // ===============================
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    // GEO JSON (for map search)
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    latitude: Number,
    longitude: Number,

    // ===============================
    // PROPERTY DETAILS
    // ===============================
    bedrooms: {
      type: Number,
      min: 0,
    },

    bathrooms: {
      type: Number,
      min: 0,
    },

    balconies: {
      type: Number,
      min: 0,
    },

    furnishingStatus: {
      type: String,
      enum: [
        "furnished",
        "semi-furnished",
        "unfurnished",
        "virtual space",
        "lockable",
        "shop",
        "coworking",
      ],
    },

    floor: {
      type: Number,
      min: 0,
    },

    ageOfConstruction: {
      type: Number, // in years
      min: 0,
    },

    superBuiltupArea: {
      value: {
        type: Number,
        required: [true, "Area value is required"],
        min: [1, "Area must be greater than 0"],
      },
      unit: { type: String, default: "sqft" },
    },

    developer: {
      type: String,
      trim: true,
    },

    project: {
      type: String,
      trim: true,
    },

    // ===============================
    // MEDIA
    // ===============================
    images: [
      {
        type: String,
      },
    ],

    // ===============================
    // AMENITIES
    // ===============================
    amenities: [
      {
        icon: { type: String, trim: true },
        label: { type: String, trim: true },
      },
    ],

    // ===============================
    // RELATIONS
    // ===============================
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ===============================
    // STATUS
    // ===============================
    status: {
      type: String,
      enum: ["active", "sold", "inactive"],
      default: "active",
    },

    // =======likes====
    likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  },

  {
    timestamps: true,
  }
);

// ===============================
// INDEXES (Performance)
// ===============================
propertySchema.index({ title: "text", description: "text" });
propertySchema.index({ "price.amount": 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });

export default mongoose.model("Property", propertySchema);