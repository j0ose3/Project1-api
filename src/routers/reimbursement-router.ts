import express from 'express';
import { reimbursementService } from '../config/app';
import { isEmptyObject } from '../util/validator';
import { managerGuard } from '../middleware/auth-middleware';

// export ReimbursementRouter
export const ReimbursementRouter = express.Router();

const ReimbService = reimbursementService;

// GET method to get all reimbs
ReimbursementRouter.get('', managerGuard, async (req, res) => {
    console.log("GET ALL REIMBS CALLED AT /reimbursements");
    
    try {
        let payload = await ReimbService.getAllReimbursements();
        res.status(200).json(payload);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }
});

// GET method to get a reimb by Id
ReimbursementRouter.get('/:id', async (req, res) => {
    console.log('GET USER BY ID CALLED AT /reimbursements/id');
    
    const id = +req.params.id;
    console.log(id);
    
    try {
        let payload = await ReimbService.getReimbursementById(id);
        res.status(200).json(payload);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }
});

// GET method to get all reimbs for a specific user 
ReimbursementRouter.get('/myreimb/:authorId', async (req, res) => {
    const authorId = +req.params.authorId;
    console.log(`GET ALL MY REIMBS CALLED AT /reimbursements/myreimb/${authorId}`);
    try {
        let payload = await ReimbService.getAllMyReimbursements(authorId);
        res.status(200).json(payload);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }
});

//GET method to filter reimbursements by type
ReimbursementRouter.get('/filtertype/:type', managerGuard, async (req, res) => {
    const type = +req.params.type;
    try {
        let payload = await ReimbService.filterReimbByType(type);
        res.status(200).json(payload);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }
});

//GET method to filter reimbursements by status
ReimbursementRouter.get('/filterstatus/:status', managerGuard, async (req, res) => {
    const status = +req.params.status;
    try {
        let payload = await ReimbService.filterReimbByStatus(status);
        res.status(200).json(payload);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }
});

// POST method to create a new reimb
ReimbursementRouter.post('',  async (req, res) => {
    console.log('POST REQUEST RECEIVED AT /reimbursements');
    console.log(req.body);

    try {
        let newReimb = await ReimbService.addNewReimbursement(req.body);
        return res.status(200).json(newReimb);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }  
});

// PUT method to update an existing reimb if status pending
ReimbursementRouter.put('', async (req, res) => {
    console.log('PUT REQUEST RECEIVED AT /reimbursements');
    console.log(req.body);

    try {
        let updatedReimb = await ReimbService.updateReimbursement(req.body);
        res.status(200).json(updatedReimb);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }    
});

// PUT method to approve or deny a pending reimbursement
ReimbursementRouter.put('/status', managerGuard, async (req, res) => {
    console.log('PUT REQUEST RECEIVED AT /reimbursements/status');
    console.log(req.body);

    try {
        let updatedReimb = await ReimbService.SetReimbursementStatus(req.body);
        res.status(200).json(updatedReimb);
    } catch (e) {
        res.status(e.statusCode).json(e);
    }    
});


// DELETE method to delete a reimb
// ReimbursementRouter.delete('', async (req, res) => {
//     console.log('DELETE REQUEST RECEIVED AT /reimbursements');
//     console.log(req.body);
//     try {
//         let deletedReimb = await ReimbService.deleteReimbursementById(req.body);
//         res.status(200).json(deletedReimb);
//     } catch (e) {
//         res.status(e.statusCode).json(e);
//     }    
// });