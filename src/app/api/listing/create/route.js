import Listing from "../../../../lib/models/listing.model.js";
import { connect } from "../../../../lib/mongodb/mongoose.js";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createOrUpdateUser } from "@/lib/actions/user";
export const POST = async (req) => {
  const user = await currentUser();
  try {
    await connect();
    const data = await req.json();

    // Debug logging
    console.log("User debug:", {
      userExists: !!user,
      userId: user?.id,
      publicMetadata: user?.publicMetadata,
      userMongoId: user?.publicMetadata?.userMongoId,
      dataUserMongoId: data.userMongoId,
    });

    if (!user) {
      return new Response("User not found", {
        status: 401,
      });
    }

    // Check if user has MongoDB ID in metadata
    let userRef = user.publicMetadata?.userMongoId;
    console.log("Initial userRef:", userRef);

    // If no MongoDB ID, create/update user in MongoDB and update Clerk metadata
    if (!userRef) {
      console.log("User missing MongoDB ID, syncing...");
      console.log("clerkClient debug:", {
        clerkClientExists: !!clerkClient,
        clerkClientUsers: !!(clerkClient && clerkClient.users),
        clerkClientKeys: clerkClient ? Object.keys(clerkClient) : 'no clerkClient'
      });
      try {
        const mongoUser = await createOrUpdateUser(
          user.id,
          user.firstName,
          user.lastName,
          user.imageUrl,
          user.emailAddresses
        );

        // Update Clerk user metadata with MongoDB ID
        try {
          if (clerkClient && clerkClient.users) {
            await clerkClient.users.updateUser(user.id, {
              publicMetadata: {
                userMongoId: mongoUser._id.toString(),
              },
            });
            console.log("Updated Clerk metadata successfully");
          } else {
            console.log("Warning: clerkClient.users not available, skipping metadata update");
          }
        } catch (metadataError) {
          console.log("Error updating Clerk metadata:", metadataError);
          console.log("Continuing without metadata update...");
        }

        userRef = mongoUser._id.toString();
        console.log("User synced successfully with MongoDB ID:", userRef);
        
        // Note: Even if Clerk metadata update failed, we still have the MongoDB user
        // The user can be synced later via the /api/sync-user endpoint
      } catch (error) {
        console.log("Error syncing user:", error);
        // Fallback to Clerk ID if sync fails
        userRef = user.id;
      }
    }

    if (
      user.publicMetadata?.userMongoId &&
      user.publicMetadata.userMongoId !== data.userMongoId
    ) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const newListing = await Listing.create({
      userRef: userRef,
      name: data.name,
      description: data.description,
      address: data.address,
      regularPrice: data.regularPrice,
      discountPrice: data.discountedPrice,
      bathrooms: data.bathrooms,
      bedrooms: data.bedrooms,
      furnished: data.furnished,
      parking: data.parking,
      type: data.type,
      offer: data.offer,
      imageUrls: data.imageUrls,
    });
    await newListing.save();
    return new Response(JSON.stringify(newListing), {
      status: 200,
    });
  } catch (error) {
    console.log("Error creating post:", error);
    return new Response("Error creating post", {
      status: 500,
    });
  }
};
