import {UserSchema, ReimbursementSchema} from './schemas';
import {User} from '../models/user';
import {Reimbursement} from '../models/reimbursement';

// make a function to map the resultSet of user-repo we get from the DB
export function mapUserResultSet(resultSet: UserSchema): User {
    // if resultSet is falsy, show empty objects as User
    if (!resultSet) {
        return {} as User;
    };

    return new User (
        resultSet.ers_user_id,
        resultSet.username,
        resultSet.password,
        resultSet.first_name,
        resultSet.last_name,
        resultSet.email,
        resultSet.role
    );
};

// make a function to map the resultSet of reimbursement-repo we get from DB
export function mapReimbursementResultSet (resultSet: ReimbursementSchema): Reimbursement {
    // if resultSet is falsy, show empty objects as Reimbursement
    if (!resultSet) {
        return {} as Reimbursement;
    }

    return new Reimbursement (
        resultSet.reimb_id,
        resultSet.amount,
        resultSet.submitted,
        resultSet.resolved,
        resultSet.description,
        resultSet.author_id,
        resultSet.resolver_id,
        resultSet.reimb_status_id,
        resultSet.reimb_type_id
    )
}