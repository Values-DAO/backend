import mongoose, {models, Schema} from "mongoose";

const trustPoolSchema = new Schema({
	// name, description, logo, values, telegram link, twitter handle, owners, members
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
	},
	logo: {
		type: String,
	},
	telegramLink: {
		type: String,
	},
	twitterHandle: {
		type: String,
	},
	organizerTwitterHandle: {
		type: String,
	},
	owners: [{
		type: Schema.Types.ObjectId,
		ref: "Users",
		required: true
	}],
	members: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: "Users"
		}],
		default: []
	}
})

const TrustPools = models.TrustPools || mongoose.model("TrustPools", trustPoolSchema);
export default TrustPools