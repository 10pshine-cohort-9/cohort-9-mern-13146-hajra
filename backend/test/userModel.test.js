const { expect } = require("chai");

const {
    createUser,
     findUserByEmail,
     findUserById,
     updateUser,
     updatePassword,
    deleteUser
} = require("../src/models/userModel");

describe("User Model ", () => {
    
    let testUserId;
    it("should create a new user", async () => {
        const testUser = {
            name: "Test User",
            email: `test_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);
        expect(testUserId).to.be.a("number");
        expect(testUserId).to.be.greaterThan(0);
    });

    it("should find a user by email", async () => {
    const testUser = {
        name: "Email Test User",
        email: `email_test_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const user = await findUserByEmail(testUser.email);

    expect(user).to.not.be.null;
    expect(user.email).to.equal(testUser.email);
    expect(user.name).to.equal(testUser.name);
});

it("should find a user by ID", async () => {
    const testUser = {
        name: "ID Test User",
        email: `id_test_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const user = await findUserById(testUserId);

    expect(user).to.not.be.null;
    expect(user.id).to.equal(testUserId);
    expect(user.name).to.equal(testUser.name);
    expect(user.email).to.equal(testUser.email);
});

it("should update a user's name and profile picture", async () => {
    const testUser = {
        name: "Update Test User",
        email: `update_test_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const affectedRows = await updateUser(testUserId, {
        name: "Updated User",
        profile_picture: "updated-profile.jpg"
    });

    expect(affectedRows).to.equal(1);

    const updatedUser = await findUserById(testUserId);

    expect(updatedUser.name).to.equal("Updated User");
    expect(updatedUser.profile_picture).to.equal("updated-profile.jpg");
});
it("should update a user's password", async () => {
    const testUser = {
        name: "Password Test User",
        email: `password_test_${Date.now()}@example.com`,
        password: "old_hashed_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const affectedRows = await updatePassword(
        testUserId,
        "new_hashed_password"
    );

    expect(affectedRows).to.equal(1);

    const updatedUser = await findUserById(testUserId);

    expect(updatedUser.password).to.equal("new_hashed_password");
});

it("should delete a user", async () => {
    const testUser = {
        name: "Delete Test User",
        email: `delete_test_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const affectedRows = await deleteUser(testUserId);

    expect(affectedRows).to.equal(1);

    const deletedUser = await findUserById(testUserId);

    expect(deletedUser).to.be.null;

    testUserId = null;
});
   afterEach(async () => {
    if (testUserId) {
        await deleteUser(testUserId);
        testUserId = null;
    }
});

});