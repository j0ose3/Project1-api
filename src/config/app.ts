import { UserRepository } from '../repos/user-repo';
import { UserService } from '../services/user-service';
import { ReimbursementRepository } from '../repos/reimbursement-repo';
import { ReimbursementService } from '../services/reimbursement-service';

// we're passing the userRepo to userService
const userRepo = new UserRepository();
const userService = new UserService(userRepo);

// we're passing the reimursementRepo to the ReimbursementService
const reimbursementRepo = new ReimbursementRepository;
const reimbursementService = new ReimbursementService(reimbursementRepo);

// export all our constants
export {
    userRepo,
    userService,
    reimbursementRepo,
    reimbursementService
}