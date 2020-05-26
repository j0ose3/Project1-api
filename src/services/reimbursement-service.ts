import { Reimbursement } from '../models/reimbursement';
import { ReimbursementRepository } from '../repos/reimbursement-repo';
import {isValidId, isValidStrings, isValidObject, isPropertyOf, isEmptyObject} from '../util/validator';
import { 
    BadRequestError, 
    ResourceNotFoundError, 
    NotImplementedError, 
    ResourcePersistenceError, 
    AuthenticationError 
} from "../errors/errors";

// export the ReimbursementService 
export class ReimbursementService {
    constructor (private reimbursementRepo: ReimbursementRepository) {
        this.reimbursementRepo = reimbursementRepo;
    }

    // The following functions will validate data 
    // and call the implementation in user-repo
    async getAllReimbursements(): Promise<Reimbursement[]> {
        // call getAll and store the value
        let reimbursements = await this.reimbursementRepo.getAll();

        // check if what we got is empty
        if (reimbursements.length == 0){
            throw new ResourceNotFoundError('There aren\'t any reimbursements available');
        }

        // return what we got
        return reimbursements;
    }

    async getReimbursementById(id: number): Promise<Reimbursement> {
        // check if id is a valid number
        if (!isValidId(id)) {
            throw new BadRequestError('The id is not valid');
        }

        // call getById and store it
        let reimbursement = await this.reimbursementRepo.getById(id);

        // is the user we got empty?
        if (isEmptyObject(reimbursement)) {
            throw new ResourceNotFoundError('There is no reimbursement for given id');
        };

        // return the user we got
        return reimbursement;
    }

    async addNewReimbursement (newReimb: Reimbursement): Promise<Reimbursement> {
        try{
            // check if new reimb is valid
            if (!isValidObject(newReimb, 'id')) {
                throw new BadRequestError('Invalid property values found in provided reimbursement');
            }

            // call addNew and store the value
            const persistedReimb = await this.reimbursementRepo.addNew(newReimb);

            // return the persistedReimb 
            return persistedReimb;
        } catch (e) {
            throw e;
        }   
    }

    async updateReimbursement (updatedReimb: Reimbursement): Promise<boolean> {
        try {
            // check if updatedReimb is a valid object
            if (!isValidObject(updatedReimb, 'id') || !isValidObject(updatedReimb.id)) {
                throw new BadRequestError('Invalid property values found in given reimbursement');
            }

            // check if it's falsy
            if (!updatedReimb) {
                throw new ResourceNotFoundError();
            }

            // call update and store the value
            let persistedReimb = await this.reimbursementRepo.update(updatedReimb);

            // return true if reimbursement was updated succesfully
            return persistedReimb;
        } catch (e) {
            throw e;
        }
    }

    async getAllMyReimbursements(authorID: number): Promise<Reimbursement[]> {
        
        // check if string is valid
        if (!isValidId(authorID)) {
            throw new BadRequestError('id is not valid');
        }

        // call getAllReimb and store the value
        let reimbursements = await this.reimbursementRepo.getAllMyReimb(authorID);

        // check if what we got is empty
        if (reimbursements.length == 0){
             throw new ResourceNotFoundError('There aren\'t any reimbursements associated with given username');
        }
 
        // return what we got
        return reimbursements;
    }

    async filterReimbByType(type: number): Promise<Reimbursement[]> {
        // check if string is valid
        if (!isValidId(type)) {
            throw new BadRequestError('type id is not valid');
        }

        // call filterReimbType and store the value
        let reimbursements = await this.reimbursementRepo.filterReimbType(type);

        // check if what we got is empty
        if (reimbursements.length == 0){
             throw new ResourceNotFoundError('There aren\'t any reimbursements');
        }
 
        // return what we got
        return reimbursements;
    }

    async filterReimbByStatus(status: number): Promise<Reimbursement[]> {
        // check if string is valid
        if (!isValidId(status)) {
            throw new BadRequestError('status id is not valid');
        }

        // call filterReimbStatus and store the value
        let reimbursements = await this.reimbursementRepo.filterReimbStatus(status);

        // check if what we got is empty
        if (reimbursements.length == 0){
             throw new ResourceNotFoundError('There aren\'t any reimbursements');
        }
 
        // return what we got
        return reimbursements;
    }

    async SetReimbursementStatus(reimb: Reimbursement): Promise<boolean> {
        // check if string is valid
        if (!isValidObject(reimb, 'id')) {
            throw new BadRequestError('object is not valid');
        }

        // call setReimbStatus and store the value
        let persistedStatus = await this.reimbursementRepo.setReimbStatus(reimb);

        // return what we got
        return persistedStatus;
    }


    // async deleteReimbursementById (jsonObj: object): Promise<boolean> {
    //     // in the following 3 lines we extract the id from the json object
    //     let keys = Object.keys(jsonObj);
    //     let val = keys[0];
    //     let reimbId = +jsonObj[val];

    //     try {
    //         // check if the id we got is a proper number
    //         if (!isValidId(reimbId)) {
    //             throw new BadRequestError('Invalid id provided');
    //         }

    //         // call deleteById and pass the id we extracted earlier
    //         let deletedReimb = this.reimbursementRepo.deleteById(reimbId);

    //         // return true if deletion was successful
    //         return deletedReimb;
    //     } catch (e) {
    //         throw e;
    //     }
    // }
}