import url from "url";
import express, { response } from "express";
import { userService } from "../config/app";
import { isEmptyObject } from "../util/validator";
import { ParsedUrlQuery } from "querystring";
import { adminGuard } from "../middleware/auth-middleware";

// create a UserRouter and export it
export const UserRouter = express.Router();

// save userService into a constant
const UserService = userService;

// we'll be using this GET method to get all Users
UserRouter.get("", adminGuard, async (req, res) => {
  console.log("GET ALL USERS AT /users");

  try {
    // parse the url
    let reqURL = url.parse(req.url, true);

    // check if the object given is empty
    if (!isEmptyObject<ParsedUrlQuery>(reqURL.query)) {
      let payload = await userService.getUserByUniqueKey({ ...reqURL.query });
      res.status(200).json(payload);
    } else {
      let payload = await userService.getAllUsers();
      res.status(200).json(payload);
    }
  } catch (e) {
    res.status(e.statusCode).json(e);
  }
});

// we'll be using this GET method to get an User by Id
UserRouter.get("/:id", adminGuard, async (req, res) => {
  // get id from the parameter being passed
  const id = +req.params.id;
  try {
    // use service to get userById and store it
    let payload = await UserService.getUserById(id);

    // send the status and returned user in json
    res.status(200).json(payload);
  } catch (e) {
    res.status(e.statusCode).json(e);
  }
});

// we'll be using this POST method to create a new User
UserRouter.post("", adminGuard, async (req, res) => {
  console.log("POST REQUEST RECEIVED AT /users");
  console.log(req.body);

  try {
    // user UserService to add a new user
    let newUser = await UserService.addNewUser(req.body);

    // send status and the new User in json
    return res.status(200).json(newUser);
  } catch (e) {
    res.status(e.statusCode).json(e);
  }
});

// we'll be using this PUT method to update a new User
UserRouter.put("", adminGuard, async (req, res) => {
  console.log("PUT REQUEST RECEIVED AT /users");
  console.log(req.body);

  try {
    // update user by using UserService and store it
    let updatedUser = await UserService.updateUser(req.body);

    // send status of request and display updatedUser in json
    res.status(200).json(updatedUser);
  } catch (e) {
    res.status(e.statusCode).json(e);
  }
});

// we'll be using this DELETE method to delete an User
UserRouter.delete("/:id", adminGuard, async (req, res) => {
  console.log("DELETE REQUEST RECEIVED AT /users");
  const id = +req.params.id;
  try {
    // delete an user
    let deletedUser = await UserService.deleteUserById(id);

    // send status and boolean stored in deletedUser
    res.status(200).json(deletedUser);
  } catch (e) {
    res.status(e.statusCode).json(e);
  }
});
