import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { createOrUpdateUser } from "@/lib/actions/user";

export const POST = async (req) => {
  try {
    const user = await currentUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "User not found",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already has MongoDB ID
    if (user.publicMetadata?.userMongoId) {
      return new Response(
        JSON.stringify({
          message: "User already synced",
          userMongoId: user.publicMetadata.userMongoId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create/update user in MongoDB
    const mongoUser = await createOrUpdateUser(
      user.id,
      user.firstName,
      user.lastName,
      user.imageUrl,
      user.emailAddresses
    );

    // Update Clerk user metadata with MongoDB ID
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        userMongoId: mongoUser._id.toString(),
      },
    });

    return new Response(
      JSON.stringify({
        message: "User synced successfully",
        userMongoId: mongoUser._id.toString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log("Error syncing user:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to sync user",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
