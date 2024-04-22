import * as cfg from "./config.js";
import * as dbRtns from "./dbRoutines.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cwd } from "process";
import { getAuthorizationHeader } from "./sharedData.js";
import { ObjectId } from "mongodb";
import { authorizeAndGetUserId } from "./Utilities.js";
import { userInfo } from "os";

const resolvers = {
  signup: async (args) => {
    try {
      const db = await dbRtns.getDBInstance();
      /*Validation*/
      var message = "";
      if (args.firstname == "" || args.firstname == undefined) {
        message += "First name field is required.";
      }
      if (args.lastname == "" || args.lastname == undefined) {
        message += "\nLast name field is required.";
      }
      if (args.email == "" || args.email == undefined) {
        message += "\nEmail field is required.";
      }
      if (args.age == "" || args.age == undefined) {
        message += "\nDate field is required.";
      }
      if (args.gender == "" || args.gender == undefined) {
        message += "\n Gender field is required.";
      }
      if (args.membership == "" || args.membership == undefined) {
        message += "\n Membership field is required.";
      }
      if (args.number == "" || args.number == undefined) {
        message += "\n Whatsapp numbet is  required.";
      }
      if (args.password == "" || args.password == undefined) {
        message += "\nPassword field is required.";
      } else if (
        args.firstname != "" &&
        args.lastname != "" &&
        args.email != "" &&
        args.password != "" &&
        args.gender != "" &&
        args.membership != "" &&
        args.number != "" &&
        args.age != ""
      ) {
        if (!args.email.includes("@")) {
          message += "\nInvalid email format. Please include '@' symbol.";
        }

        if (args.password.length < 8) {
          message += "\n Password must be at least 8 characters long.";
        }
      }

      if (message !== "") {
        return {
          errorMessage: message,
        };
      }
      // See if a user with that email Id already exists
      let existingUser = await dbRtns.findOne(db, `AUTH`, {
        email: args.email,
      });

      if (existingUser ?? false) {
        return {
          errorMessage: `A user with email ${args.email} already exists`,
        };
      }
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const authData = {
        firstname: args.firstname,
        lastname: args.lastname,
        email: args.email,
        password: hashedPassword, // Store hashed password
      };

      const token = jwt.sign({ email: args.email }, cfg.jwtSecret, {
        expiresIn: "1h",
      });

      let authResult = await dbRtns.addOne(db, "AUTH", authData);

      // Now, let's create a userprofile for the user
      const userProfileData = {
        firstname: args.firstname,
        lastname: args.lastname,
        age: args.age,
        email: args.email,
        gender: args.gender,
        bio: "",
        number: args.number,
        membership: args.membership,
        userId: authResult.insertedId,
      };

      let userProfileResult = await dbRtns.addOne(
        db,
        "userprofile",
        userProfileData
      );

      return { token, user: authData };
    } catch (error) {
      // Handle any errors that occur
      console.error("Error occurred in fetching results:", error);
      return {
        errorMessage: `An error occurred when trying to signup.`,
      };
    }
  },
  login: async (args) => {
    try {
      /*Validation*/
      var message = "";
      if (args.email == "" || args.email == undefined) {
        message += "Email field is required.";
      }
      if (args.password == "" || args.password == undefined) {
        message += "\nPassword field is required.";
      }
      if (message !== "") {
        return {
          errorMessage: message,
        };
      }

      const db = await dbRtns.getDBInstance();
      const user = await dbRtns.findOne(db, "AUTH", { email: args.email });
      if (!user) {
        return {
          errorMessage: `User with email '${args.email}' wasn't found.`,
        };
      }
      // Compare the password provided in the arguments with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(args.password, user.password);
      if (!passwordMatch) {
        return {
          errorMessage: `User exists, but incorrect password.`,
        };
      }

      // If password matches, generate JWT token
      const token = jwt.sign({ userId: user._id }, cfg.jwtSecret);

      // Return token and user information
      return {
        token,
        user: {
          id: user._id,
          firstname: user.firstname,
          email: user.email,
        },
      };
    } catch {
      console.log("Here is your error");
    }
  },

  AdminSignup: async (args) => {
    try {
      const db = await dbRtns.getDBInstance();

      console.log(args.adminName);
      /*Validation*/
      var message = "";
      if (args.adminName == "" || args.adminName == undefined) {
        message += "First name field is required.";
      }

      if (args.password == "" || args.password == undefined) {
        message += "\nPassword field is required.";
      } else if (args.adminName != "") {
        if (args.password.length < 8) {
          message += "\n Password must be at least 8 characters long.";
        }
      }

      if (message !== "") {
        return {
          errorMessage: message,
        };
      }
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const authData = {
        adminName: args.adminName,
        password: hashedPassword, // Store hashed password
      };

      console.log(authData);

      const token = jwt.sign({ email: args.email }, cfg.jwtSecret, {
        expiresIn: "1h",
      });

      console.log(token);

      let authResult = await dbRtns.addOne(db, "ADMINAUTH", authData);

      console.log(authResult);

      return { token, admin: authData };
    } catch (error) {
      // Handle any errors that occur
      console.error("Error occurred in fetching results:", error);
      return {
        errorMessage: `An error occurred when trying to signup.`,
      };
    }
  },
  AdminLogin: async (args) => {
    try {
      /*Validation*/

      var message = "";
      if (args.adminName == "" || args.adminName == undefined) {
        message += "username field is required.";
      }
      if (args.password == "" || args.password == undefined) {
        message += "\nPassword field is required.";
      }
      if (message !== "") {
        return {
          errorMessage: message,
        };
      }

      console.log(args);
      const db = await dbRtns.getDBInstance();
      const admin = await dbRtns.findOne(db, "ADMINAUTH", {
        adminName: args.adminName,
      });
      if (!admin) {
        return {
          errorMessage: `Admin with name '${args.adminName}' wasn't found.`,
        };
      }
      // Compare the password provided in the arguments with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(args.password, admin.password);
      if (!passwordMatch) {
        return {
          errorMessage: `Admin exists, but incorrect password.`,
        };
      }

      // If password matches, generate JWT token
      //   const token = jwt.sign({ userId: user._id }, cfg.jwtSecret);
      const token = jwt.sign({ adminId: admin._id }, cfg.jwtSecret);

     
      // Return token and user information
      return {
        token,
        admin: {
          adminName: admin.adminName,
          password: admin.password,
        },
      };
    } catch {
      console.log("Here is your error");
    }
  },

  getUserProfile: async () => {
    try {
      const idString = await authorizeAndGetUserId();
      const userId = new ObjectId(idString);

      // Fetch user profile data using the user ID
      const db = await dbRtns.getDBInstance();
      const userProfile = await dbRtns.findOne(db, "userprofile", { userId });
      if (!userProfile) {
        throw new Error("User profile not found.");
      }

      return userProfile;
    } catch (error) {
      // Handle any errors that occur
      console.error("Error occurred in fetching user profile:", error);
      throw new Error("Failed to fetch user profile.");
    }
  },

  // Calculates and returns Statistics to be viewed by the admin
  getStats: async () => {
    try {
      // Fetch user profile data using the user ID
      const db = await dbRtns.getDBInstance();
      const userProfiles = await dbRtns.findAll(db, "userprofile"); // Get all user profiles

      if (!userProfiles) {
        throw new Error(
          "Error in getStats: User profiles could not be fetched."
        );
      }

      // Create a stats object, like in the Schema
      let stats = {
        numTotalUsers: userProfiles.length,
        numMaleUsers: userProfiles.filter((u) => u.gender === "Male").length,
        numFemaleUsers: userProfiles.filter((u) => u.gender === "Female")
          .length,
        numFreeUsers: userProfiles.filter((u) => u.membership === "Free")
          .length,
        numPaidUsers: userProfiles.filter((u) => u.membership === "Paid")
          .length,
        numProgrammingSkill: userProfiles.filter(
          (u) => u.skill && u.skill.includes("Programming")
        ).length,
        numDBManagementSkill: userProfiles.filter(
          (u) => u.skill && u.skill.includes("Database Management")
        ).length,
        numNetworkSecuritySkill: userProfiles.filter(
          (u) => u.skill && u.skill.includes("Network Security")
        ).length,
        numCybersecuritySkill: userProfiles.filter(
          (u) => u.skill && u.skill.includes("Cybersecurity")
        ).length,
        numITSBSkill: userProfiles.filter(
          (u) => u.skill && u.skill.includes("IT Security Basics")
        ).length,
        numCustomerServiceSkill: userProfiles.filter(
          (u) => u.skill && u.skill.includes("Customer Service")
        ).length,
      };

      return stats;
    } catch (error) {
      // Handle any errors that occur
      console.error("Error occurred in calculating stats:", error);
      throw new Error("Failed to calculate stats.");
    }
  },

  getUserSurvey: async () => {
    try {
      // Fetch user profile data using the user ID
      const db = await dbRtns.getDBInstance();
      const feedback = await dbRtns.findAll(db, "Feedback"); // Get all feedback

      if (!feedback) {
        throw new Error(
          "Error in getUserSurver: Feedback could not be fetched."
        );
      }

      // Create a Feedback object, like in the Schema
      let stats = {
        numTotalFeedback: feedback.length,
        numAmazing: feedback.filter((u) => u.Label === "Amazing").length,
        numGood: feedback.filter((u) => u.Label === "Good").length,
        numOk: feedback.filter((u) => u.Label === "Ok").length,
        numBad: feedback.filter((u) => u.Label === "Bad").length,
        numAweful: feedback.filter((u) => u.Label === "Aweful").length,
      };
      return stats;
    } catch (error) {
      // Handle any errors that occur
      console.error("Error occurred in calculating stats:", error);
      throw new Error("Failed to calculate stats.");
    }
  },

  addOrUpdateBio: async (args) => {
    try {
      const userId = await authorizeAndGetUserId();

      // Get the database instance
      const db = await dbRtns.getDBInstance();

      // Define the criteria to find the user profile
      const criteria = { userId: new ObjectId(userId) };

      // Update the user profile with the provided bio
      const updatedUserProfile = await dbRtns.updateOne(
        db,
        "userprofile",
        criteria,
        { bio: args.bio }
      );

      if (!updatedUserProfile) {
        throw new Error("Failed to update user profile.");
      }

      // Return the updated user profile
      return updatedUserProfile.value;
    } catch (error) {
      console.error("Error occurred while adding or updating bio:", error);
      throw new Error("Failed to add or update bio.");
    }
  },
  addorUpdateSkills: async (args) => {
    try {
      const userId = await authorizeAndGetUserId();

      // Get the database instance
      const db = await dbRtns.getDBInstance();

      // Define the criteria to find the user profile
      const criteria = { userId: new ObjectId(userId) };

      // Update the user profile with the provided bio
      const updatedUserProfile = await dbRtns.updateOne(
        db,
        "userprofile",
        criteria,
        { skill: args.skill }
      );

      if (!updatedUserProfile) {
        throw new Error("Failed to update user profile.");
      }

      // Return the updated user profile
      return updatedUserProfile.value;
    } catch (error) {
      console.error("Error occurred while adding or updating skills:", error);
      throw new Error("Failed to add or update skils.");
    }
  },

  updateProfilePicture: async (args) => {
    try {
      const userId = await authorizeAndGetUserId();
      // Get the database instance
      const db = await dbRtns.getDBInstance();
      // Define the criteria to find the user profile
      const criteria = { userId: new ObjectId(userId) };
      // Update the user profile with the new picture
      const updatedUserProfile = await dbRtns.updateOne(
        db,
        "userprofile",
        criteria,
        { profilepicture: args.profilepicture }
      );

      if (!updatedUserProfile) {
        throw new Error("Failed to update profile picture");
      }
      // Return the updated user profile
      return updatedUserProfile.value;
    } catch (error) {
      console.error("Error occurred while updating profile picture", error);
    }
  },
  getMatches: async () => {
    try {
      const idString = await authorizeAndGetUserId();
      const userId = new ObjectId(idString);

      // Fetch user profile data using the user ID
      const db = await dbRtns.getDBInstance();
      const userProfile = await dbRtns.findOne(db, "userprofile", { userId });
      if (!userProfile) {
        throw new Error("User profile not found.");
      }

      /**Based on this profile get matches*/
      // First get users that are not of the same gender
      let matches = await dbRtns.findAll(
        db,
        "userprofile",
        {
          gender: userProfile.gender == "Male" ? "Female" : "Male",
        },
        {}
      );
      return matches;
    } catch (error) {
      // Handle any errors that occur
      console.error("Error occurred in getMatches:", error);
    }
  },
  addFeedback: async (args) => {
    try {
      // Get the database instance
      const db = await dbRtns.getDBInstance();

      const addFeedbackLabel = await dbRtns.addOne(db, "Feedback", {
        Label: args.label,
      });

      if (!addFeedbackLabel) {
        throw new Error("Failed to add Label");
      }

      return addFeedbackLabel.value;
    } catch (error) {
      console.error("Error occurred while updating profile picture", error);
    }
  },
};
export { resolvers };
