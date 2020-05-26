import { ReimbursementService } from '../services/reimbursement-service';
import { ReimbursementRepository } from '../repos/reimbursement-repo';
import { Reimbursement } from '../models/reimbursement';
import Validator from '../util/validator';
import {
    ResourceNotFoundError,
    BadRequestError,
    AuthenticationError,
    ResourcePersistenceError,
} from '../errors/errors';

jest.mock('../repos/Reimbursement-repo', () => {
    return new class ReimbRepository {
        getAllReimbursements = jest.fn();
        getReimbursementById = jest.fn();
        filterReimbByType = jest.fn();
        filterReimbByStatus = jest.fn();
        addNewReimbursement = jest.fn();
        updateReimbursement = jest.fn();
        setReimbursementStatus = jest.fn();
    }
});

describe('ReimbService', () => {

    let sut: ReimbursementService;
    let mockRepo;
    let date = new Date();
    let mockReimbs = [
        new Reimbursement(1, 100, date, date, 'text', 1, 2, 1, 1),
        new Reimbursement(2, 200, date, date, 'text', 1, 2, 1, 1),
        new Reimbursement(3, 300, date, date, 'text', 1, 2, 1, 1),
        new Reimbursement(4, 400, date, date, 'text', 1, 2, 1, 1),
        new Reimbursement(5, 500, date, date, 'text', 1, 2, 1, 1)
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {
            return {
                getAllReimbursements: jest.fn(),
                getReimbursementById: jest.fn(),
                filterReimbByType: jest.fn(),
                filterReimbByStatus: jest.fn(),
                addNewReimbursement: jest.fn(),
                updateReimbursement: jest.fn(),
                setReimbursementStatus: jest.fn()
            }
        });
        // @ts-ignore
        sut = new ReimbursementService(mockRepo);

    });

    test('should resolve to getAllReimbs[] when getAllReimbs() successfully retrieves getAllReimbs from the data source', async () => {
        // Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockReimbs);

        // Act
        let result = await sut.getAllReimbursements();

        // Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(5);
    });

    test('should reject with ResourceNotFoundError when getAllReimbs fails to get any getAllReimbs from the data source', async () => {
        // Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        // Act
        try {
            await sut.getAllReimbursements();
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should resolve to Reimb when getReimbById is given a valid a known id', async () => {
        // Arrange
        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursement>((resolve) => resolve(mockReimbs[id - 1]));
        });

        // Act
        let result = await sut.getReimbursementById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
    });

    test('should reject with BadRequestError when getReimbById is given an invalid value as an id (decimal)', async () => {
        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(3.14);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with BadRequestError when getReimbById is given an invalid value as an id (zero)', async () => {
        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(0);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with BadRequestError when getReimbById is given a invalid value as an id (NaN)', async () => {
        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(NaN);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with BadRequestError when getReimbById is given a invalid value as an id (negative)', async () => {
        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(-2);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with ResourceNotFoundError if getReimbById is given an unknown id', async () => {
        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(true);

        // Act
        try {
            await sut.getReimbursementById(9999);
        } catch (e) {
            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });
    
    test('should addNew to Reimb', async () => {
        // Arrange
        expect.assertions(2);
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.addNew = jest.fn().mockImplementation((newReimb: Reimbursement) => {
			return new Promise<Reimbursement>((resolve) => {
				mockReimbs.push(newReimb); 
				resolve(newReimb);
			});
		});

        // Act
        let newReimb = new Reimbursement(6, 100, date, date, 'text', 1, 2, 1, 1);
        let result = await sut.addNewReimbursement(newReimb);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(6);
    });

    test('should reject with BadRequestError if invalid reimb', async () => {
        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.addNew = jest.fn().mockImplementation((newReimb: Reimbursement) => {
			return new Promise<Reimbursement>((resolve) => {
				mockReimbs.push(newReimb); 
				resolve(newReimb);
			});
		});

        // Act
        let newReimb = new Reimbursement(6, 100, date, date, 'text', 1, 2, 1, 1);

        try {
            await sut.addNewReimbursement(newReimb);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should update Reimb', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockReturnValue(mockReimbs[0]);

        // Act
        let result = await sut.updateReimbursement(mockReimbs[0]);

        // Assert
        expect(result).toBeTruthy();
    });

    test('should reject with BadRequestError if invalid id', async () => {

        // Arrange
        //expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockReturnValue({});

        // Act
        let newReimb = new Reimbursement(7, 500, date, date, 'text', 1, 2, 1, 1);

        try {
            await sut.updateReimbursement(newReimb);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourcePersistenceError if invalid reimb', async () => {
        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);

        mockRepo.update = jest.fn().mockReturnValue(mockReimbs[0]);
        // Act

        let newReimb = new Reimbursement(6, 500, date, date, 'text', 1, 2, null, 1);

        try {
            await sut.updateReimbursement(newReimb);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with ResourcePersistenceError if invalid id', async () => {
        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockReturnValue(mockReimbs[0]);

        // Act
        let newReimb = new Reimbursement(null, 500, date, date, 'text', 1, 2, null, 1);

        try {
            await sut.updateReimbursement(newReimb);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with ResourcePersistenceError if invalid status', async () => {
        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        mockRepo.update = jest.fn().mockReturnValue(mockReimbs[0]);
        // Act

        let newReimb = new Reimbursement(1, 500, date, date, 'text', 1, 2, 1, 1);

        try {
            await sut.updateReimbursement(newReimb);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });
});