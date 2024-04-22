export const schema = `
 type Query {
    getUserProfile : User
    getMatches:[User]
    getStats:Stats
    getUserSurvey:UserSurvey
   },
  type User {
    id: ID
    firstname: String
    lastname: String
    email: String
    age:String
    gender: String
    membership: String
    number:String
    password: String
    bio:String
    skill:String
    profilepicture:String
}, 
 type feedback {
    label:String
 },
type Admin {
    adminName: String,
    password: String
},

type Stats {
    numTotalUsers: Int!,
    numMaleUsers: Int!,
    numFemaleUsers: Int!,
    numFreeUsers: Int!,
    numPaidUsers: Int!,
    numProgrammingSkill: Int!,
    numDBManagementSkill: Int!,
    numNetworkSecuritySkill: Int!,
    numCybersecuritySkill: Int!,
    numITSBSkill: Int!,
    numCustomerServiceSkill: Int!
},

type UserSurvey {
    numTotalFeedback:Int,
    numAmazing:Int,
    numGood:Int,
    numOk:Int,
    numBad:Int,
    numAweful:Int,
},
type AuthPayload {
    token: String
    user: User
    admin: Admin
    errorMessage: String 
},
type Mutation {
    signup(firstname: String, lastname: String, email: String, age:String, gender:String, membership:String, number: String,  password: String): AuthPayload
    AdminSignup ( adminName: String,  password: String): AuthPayload
    login(email: String, password: String): AuthPayload
    AdminLogin (adminName:String , password:String): AuthPayload
    addOrUpdateBio(bio:String):User
    updateProfilePicture(profilepicture:String):User
    addorUpdateSkills(skill:String):User
    addFeedback(label:String):feedback
}
`;
