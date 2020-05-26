import { User } from "../models/user";
import { UserRepository } from "../repos/user-repo";
import {
  isValidId,
  isValidStrings,
  isValidObject,
  isPropertyOf,
  isEmptyObject,
} from "../util/validator";
import {
  BadRequestError,
  ResourceNotFoundError,
  NotImplementedError,
  ResourcePersistenceError,
  AuthenticationError,
} from "../errors/errors";

export class UserService {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  // the following functions will validate data and call the userRepo
  async getAllUsers(): Promise<User[]> {
    // call getAll()
    let users = await this.userRepository.getAll();

    // make sure that what we got is not empty
    if (users.length == 0) {
      throw new ResourceNotFoundError("There aren't any users in the DB");
    }

    // return all the users
    return users.map(this.removePassword);
  }

  async getUserById(id: number): Promise<User> {
    // validate id to make sure id is a number
    if (!isValidId(id)) {
      throw new BadRequestError("This is not a valid id");
    }

    // call getById from userRepo
    let user = await this.userRepository.getById(id);

    // make sure what we got does exist
    if (isEmptyObject(user)) {
      throw new ResourceNotFoundError("There aren't any user with given id");
    }

    // just return our user
    return this.removePassword(user);
  }

  async getUserByUniqueKey(queryObj: any): Promise<User> {
    // we need to wrap this up in a try/catch in case errors are thrown for our awaits
    try {
      let queryKeys = Object.keys(queryObj);

      // check that the properties belong to the object
      if (!queryKeys.every((key) => isPropertyOf(key, User))) {
        throw new BadRequestError();
      }

      // we will only support single param search
      let key = queryKeys[0];
      let val = queryObj[key];

      // if they are searching for a user by id, reuse the logic we already have
      if (key === "id") {
        return await this.getUserById(+val);
      }

      // ensure that the provided key value is valid
      if (!isValidStrings(val)) {
        throw new BadRequestError();
      }

      let user = await this.userRepository.getByUniqueKey(key, val);

      if (isEmptyObject(user)) {
        throw new ResourceNotFoundError();
      }

      return this.removePassword(user);
    } catch (e) {
      throw e;
    }
  }

  async authenticateUser(un: string, pw: string): Promise<User> {
    try {
      // check to see if the un and pw are strings
      if (!isValidStrings(un, pw)) {
        throw new BadRequestError();
      }

      let authUser: User;

      // check if the user really exists by these credentials
      authUser = await this.userRepository.getUserByCredentials(un, pw);

      // check if what we got is empty
      if (isEmptyObject(authUser)) {
        throw new AuthenticationError("Bad credentials provided.");
      }

      // return the authUser after password is removed
      return this.removePassword(authUser);
    } catch (e) {
      throw e;
    }
  }

  async addNewUser(newUser: User): Promise<User> {
    try {
      // is our input a valid User?
      if (!isValidObject(newUser, "id")) {
        throw new BadRequestError(
          "Invalid property value found in provided user"
        );
      }

      let usernameAvailable = await this.isUsernameAvailable(newUser.username);

      if (!usernameAvailable) {
        throw new ResourcePersistenceError();
      }

      let emailAvailable = await this.isEmailAvailable(newUser.email);

      if (!emailAvailable) {
        throw new ResourcePersistenceError();
      }
      const persistedUser = await this.userRepository.addNew(newUser);

      return this.removePassword(persistedUser);
    } catch (e) {
      throw e;
    }
  }

  async updateUser(updateUser: User): Promise<boolean> {
    try {
      // is our input a valid User?
      if (!isValidObject(updateUser, "id")) {
        throw new BadRequestError(
          "Invalid properly value found in provided user"
        );
      }

      // run update from user repo and store that value
      const persistedUser = await this.userRepository.update(updateUser);

      // return stored value
      return persistedUser;
    } catch (e) {
      throw e;
    }
  }

  async deleteUserById(id: number): Promise<boolean> {
    try {
      // validate if id is a number
      if (!isValidId(id)) {
        throw new BadRequestError("Invalid id provided");
      }

      // call deleteById on user repos and store boolean
      let deletedUser = await this.userRepository.deleteById(id);

      // just return the boolean which is most likely true
      return deletedUser;
    } catch (e) {
      throw e;
    }
  }

  // we make this function to remove the password from the User
  private removePassword(user: User): User {
    // if there is no password, then just return the user
    if (!user || !user.password) return user;

    // else, pass a copy of user with password deleted
    let usr = { ...user };
    delete usr.password;
    return usr;
  }

  private async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      await this.getUserByUniqueKey({ username: username });
    } catch (e) {
      return true;
    }
    return false;
  }

  private async isEmailAvailable(email: string): Promise<boolean> {
    try {
      await this.getUserByUniqueKey({ email: email });
    } catch (e) {
      return true;
    }
    return false;
  }
}
