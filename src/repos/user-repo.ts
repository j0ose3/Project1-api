import { User } from "../models/user";
import { CrudRepository } from "./crud-repo";
import { InternalServerError } from "../errors/errors";
import { PoolClient, Pool } from "pg";
import { connectionPool } from "..";
import { mapUserResultSet } from "../util/result-set-mapper";

export class UserRepository implements CrudRepository<User> {
  baseQuery = `select u.ers_user_id, 
                        u.username, 
                        u.password, 
                        u.first_name, 
                        u.last_name, 
                        u.email, 
                        r.role_name as role
                        from ers_users u join 
                        ers_user_roles r 
                        on u.user_role_id = r.role_id`;

  // the following functions will be called from UserService
  async getAll(): Promise<User[]> {
    let client: PoolClient;
    try {
      // connection to DB
      client = await connectionPool.connect();

      // sql will be the query we'll be running by using the baseQuery
      let sql = `${this.baseQuery}`;

      // now we wait to recieve the data
      let rs = await client.query(sql);

      // use mapper to return the values
      return rs.rows.map(mapUserResultSet);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      // make sure to release the connection to the DB at the end
      client && client.release();
    }
  }

  async getById(id: number): Promise<User> {
    let client: PoolClient;
    try {
      // make connection to db
      client = await connectionPool.connect();

      // this time we use the baseQuery but add the id input
      let sql = `${this.baseQuery} where u.ers_user_id = $1`;

      // wait to recieve the data
      let rs = await client.query(sql, [id]);

      // This time we map only one user
      return mapUserResultSet(rs.rows[0]);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async getByUniqueKey(key: string, val: string) {
    let client: PoolClient;

    try {
      // connect to db
      client = await connectionPool.connect();

      // query
      let sql = `${this.baseQuery} where u.${key} = $1`;

      // run query
      let rs = await client.query(sql, [val]);
      return mapUserResultSet(rs.rows[0]);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async getUserByCredentials(un: string, pw: string) {
    let client: PoolClient;

    try {
      client = await connectionPool.connect();
      let sql = `${this.baseQuery} where u.username = $1 and u.password = $2`;
      let rs = await client.query(sql, [un, pw]);
      return mapUserResultSet(rs.rows[0]);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async addNew(newUser: User): Promise<User> {
    let client: PoolClient;
    try {
      // make connection to DB
      client = await connectionPool.connect();

      // since we're passing role name, we need to get role Id
      // because role name doesn't exist in the user table in db
      let roleId = (
        await client.query(
          `select role_id 
                                                from ers_user_roles r 
                                                where r.role_name = $1`,
          [newUser.role]
        )
      ).rows[0].role_id;

      // we'll run this query to insert a new user and return the id
      let sql = `insert into ers_users (username, password, first_name, last_name, email, user_role_id) values
            ($1, $2, $3, $4, $5, $6) returning ers_user_id`;

      // we'll wait for the query to go through
      let rs = await client.query(sql, [
        newUser.username,
        newUser.password,
        newUser.fname,
        newUser.lname,
        newUser.email,
        roleId,
      ]);
      console.log(rs);

      // the new user id will be equal to the returned id
      // we didn't pass an id in the new user
      // since id is a serial type in our DB
      newUser.id = rs.rows[0].ers_user_id;

      // return the new user
      return newUser;
    } catch (e) {
      // throw this error if there are username or email are already taken in the db
      throw new InternalServerError(
        "Couldn't add given user, your username and email must be unique"
      );
    } finally {
      client && client.release();
    }
  }

  async update(user: User): Promise<boolean> {
    let client: PoolClient;
    try {
      // connection to DB
      client = await connectionPool.connect();

      // same as b4, we get the role id because we passed role name
      let roleId = (
        await client.query(
          `select role_id 
                                                from ers_user_roles r 
                                                where r.role_name = $1`,
          [user.role]
        )
      ).rows[0].role_id;

      // query to update the existing user of our db
      let sql = `update ers_users set username = $2,
                                            password = $3,
                                            first_name = $4,
                                            last_name = $5,
                                            email = $6,
                                            user_role_id = $7
                                            where ers_user_id = $1`;

      // run the query
      let rs = await client.query(sql, [
        user.id,
        user.username,
        user.password,
        user.fname,
        user.lname,
        user.email,
        roleId,
      ]);

      // return true
      return true;
    } catch (e) {
      // throw error if you had invalid input
      throw new InternalServerError("Invalid input to update user");
    } finally {
      client && client.release();
    }
  }

  async deleteById(id: number): Promise<boolean> {
    let client: PoolClient;
    try {
      // connection to DB
      client = await connectionPool.connect();

      // delete user query
      let sql = `delete from ers_users where ers_user_id = $1`;

      // run query
      await client.query(sql, [id]);

      // always return true whether we deleted something or not
      // because we don't care if something got deleted, all we
      // care is that it doesn't exist anymore.
      return true;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }
}
