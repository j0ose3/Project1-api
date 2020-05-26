import { Reimbursement } from "../models/reimbursement";
import { CrudRepository } from "./crud-repo";
import { InternalServerError, BadRequestError } from "../errors/errors";
import { PoolClient } from "pg";
import { connectionPool } from "..";
import { mapReimbursementResultSet } from "../util/result-set-mapper";

// export the ReimbursementRepository
export class ReimbursementRepository implements CrudRepository<Reimbursement> {
  baseQuery = `select r.reimb_id, 
                        r.amount, 
                        r.submitted, 
                        r.resolved, 
                        r.description, 
                        u.username as author, 
                        r.resolver_id as resolver,
                        s.reimb_status as status,
                        t.reimb_type as type
                        from ers_reimbursements r 
                        join ers_users u 
                        on r.author_id = u.ers_user_id 
                        join ers_reimbursement_statuses s
                        on r.reimb_status_id = s.reimb_status_id 
                        join ers_reimbursement_types t 
                        on r.reimb_type_id = t.reimb_type_id`;

  // the following methods will be called from ReimbursementService
  async getAll(): Promise<Reimbursement[]> {
    let client: PoolClient;
    try {
      // make connection to DB
      client = await connectionPool.connect();

      // baseQuery to getAllReimb
      let sql = `select * from ers_reimbursements`;

      // run the query
      let rs = await client.query(sql);

      // map all reimb and return them
      return rs.rows.map(mapReimbursementResultSet);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async getById(id: number): Promise<Reimbursement> {
    let client: PoolClient;
    try {
      // connection to db
      client = await connectionPool.connect();

      // this is our query
      let sql = `select * from ers_reimbursements where reimb_id = $1`;

      // run our query
      let rs = await client.query(sql, [id]);
      console.log(mapReimbursementResultSet(rs.rows[0]));
      

      // map the resultSet and return it
      return mapReimbursementResultSet(rs.rows[0]);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async addNew(newReimbursement: Reimbursement): Promise<Reimbursement> {
    let client: PoolClient;
    try {
      // make a new date for today
      let today = new Date();

      // arrange today's date in sql form
      let todayDate =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();

      // now arrange the time in sql form
      let todayTime =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

      // now concat today's date and today's time for submitted field
      let newSubmitted = todayDate + " " + todayTime;

      // the initial status will always be pending when you first make a new reimb
      const newStatus = 1;

      client = await connectionPool.connect();     
      
      // query to create new reimbursement
      let sql = `insert into ers_reimbursements (amount, submitted, description,
                                                author_id, reimb_status_id, reimb_type_id) values
                                                ($1, $2, $3, $4, $5, $6) returning reimb_id`;

      // run query
      let rs = await client.query(sql, [
        newReimbursement.amount,
        newSubmitted,
        newReimbursement.description,
        newReimbursement.author,
        newStatus,
        newReimbursement.type,
      ]);
      
      // make the new reimbursement id equal to the id created by the db
      newReimbursement.id = rs.rows[0].reimb_id;

      // return the new reimb
      return newReimbursement;
    } catch (e) {
      throw new InternalServerError("Couldn't add given reimbursement");
    } finally {
      client && client.release();
    }
  }

  async update(updatedReimbursement: Reimbursement): Promise<boolean> {
    let client: PoolClient;
    try {
      // make db connection
      client = await connectionPool.connect();

      let status = (await client.query(`select reimb_status_id from ers_reimbursements where reimb_id = $1`, 
                    [updatedReimbursement.id])).rows[0].reimb_status_id;

      // here we check if the status is pending
      if (status == 2 || status == 3) {
        throw new BadRequestError(
          "You can only update a pending reimbursement"
        );
      }

      // we need to get submitted time from DB because we can't change that
      let getSubmitted = (
        await client.query(
          `select submitted 
                                                    from ers_reimbursements 
                                                    where reimb_id = $1`,
          [updatedReimbursement.id]
        )
      ).rows[0].submitted;

      // we need to get author id
      let authorId = (
        await client.query(
          `select ers_user_id 
                                                from ers_users 
                                                where ers_user_id = $1`,
          [updatedReimbursement.author]
        )
      ).rows[0].ers_user_id;

      // query to update reimb
      let sql = `update ers_reimbursements set amount = $2,
                                                description = $3,
                                                author_id = $4,
                                                reimb_type_id = $5
                                                where reimb_id = $1`;

      // run query
      let rs = await client.query(sql, [
        updatedReimbursement.id,
        updatedReimbursement.amount,
        updatedReimbursement.description,
        authorId,
        updatedReimbursement.type
      ]);

      // return boolean
      return true;
    } catch (e) {
      throw new InternalServerError("Invalid input to update user");
    } finally {
      client && client.release();
    }
  }

  async getAllMyReimb (authorId: number): Promise<Reimbursement[]> {
      let client: PoolClient;
      try {
          // make connection to DB
          client = await connectionPool.connect();

          // baseQuery to getAllReimb
          let sql = `select * from ers_reimbursements where author_id = $1`;

          // run the query
          let rs = await client.query(sql,[authorId]);

          // map all reimb and return them
          return rs.rows.map(mapReimbursementResultSet);
      } catch (e) {
          throw new InternalServerError();
      } finally {
          client && client.release();
      }
  }

  async filterReimbType(type: number): Promise<Reimbursement[]> {
    let client: PoolClient;
    try {
      // make connection to DB
      client = await connectionPool.connect();

      // baseQuery to getAllReimb
      let sql = `select * from ers_reimbursements where reimb_type_id = $1`;

      // run the query
      let rs = await client.query(sql, [type]);

      // map all reimb and return them
      return rs.rows.map(mapReimbursementResultSet);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async filterReimbStatus(status: number): Promise<Reimbursement[]> {
    let client: PoolClient;
    try {
      // make connection to DB
      client = await connectionPool.connect();

      // baseQuery to getAllReimb
      let sql = `select * from ers_reimbursements where reimb_status_id = $1`;

      // run the query
      let rs = await client.query(sql, [status]);

      // map all reimb and return them
      return rs.rows.map(mapReimbursementResultSet);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  async setReimbStatus(reimb: Reimbursement): Promise<boolean> {
    let client: PoolClient;
    try {
      // make connection to DB
      client = await connectionPool.connect();

      // make a new date for today
      let today = new Date();

      // arrange today's date in sql form
      let todayDate =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();

      // now arrange the time in sql form
      let todayTime =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

      // now concat today's date and today's time for submitted field
      let newResolved = todayDate + " " + todayTime;

      // baseQuery to getAllReimb
      let sql = `update ers_reimbursements set reimb_status_id = $2,
                                                    resolved = $3,
                                                    resolver_id = $4
                                                    where reimb_id = $1`;

      // run the query
      let rs = await client.query(sql, [reimb.id, reimb.status, newResolved, reimb.resolver]);

      // return boolean
      return true;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      client && client.release();
    }
  }

  // async deleteById(id: number): Promise<boolean> {
  //     let client: PoolClient;
  //     try {
  //         client = await connectionPool.connect();

  //         // query to delete reimb
  //         let sql = `delete from ers_reimbursements where reimb_id = $1`;

  //         // run query
  //         await client.query(sql, [id]);

  //         // always return true if query ran successfully
  //         return true;
  //     } catch (e) {
  //         throw new InternalServerError();
  //     } finally {
  //         client && client.release();
  //     }
  // }
}
