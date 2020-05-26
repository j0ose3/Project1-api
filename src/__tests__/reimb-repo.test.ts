import { ReimbursementRepository } from '../repos/reimbursement-repo';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import { Reimbursement } from '../models/reimbursement';
import { InternalServerError } from '../errors/errors';

jest.mock('..', () => {
    return {
        connectionPool: {
            connect: jest.fn()
        }
    };
});

jest.mock('../util/result-set-mapper', () => {
    return {
        mapReimbursementResultSet: jest.fn()
    };
});

describe('reimbursementRepo', () => {

    let sut = new ReimbursementRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() => {

        (mockConnect as jest.Mock).mockClear().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return {
                        rows: [
                            {
                                id: 1,
                                amount: 100,
                                submitted: new Date(),
                                resolved: new Date(),
                                description: 'test',
                                author: 1,
                                resolver: 1,
                                status: 1,
                                type: 1
                            }
                        ]
                    };
                }),
                release: jest.fn()
            };
        });

        (mockMapper.mapReimbursementResultSet as jest.Mock).mockClear();
    });

    test('should resolve to an array of Reimbs when getAll retrieves records from data source', async () => {
        // Arrange
        expect.hasAssertions();
        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimb);

        // Act
        let result = await sut.getAll();

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should resolve to an empty array when getAll retrieves a records from data source', async () => {
        // Arrange
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] }; }),
                release: jest.fn()
            };
        });

        // Act
        let result = await sut.getAll();

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);
    });

    test('should throw InternalServerError when getAll() is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.getAll();
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to a Reimb object when getById retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();
        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimb);

        // Act
        let result = await sut.getById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Reimbursement).toBe(true);
    });

    test('should resolve to an empty array when getById retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] }; }),
                release: jest.fn()
            };
        });

        // Act
        let result = await sut.getById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Reimbursement).toBe(true);
    });

    test('should throw InternalServerError when getById() is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return false; }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.getById(mockReimb.id);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to a Reimb object when filterByType retrieves records from data source', async () => {

        // Arrange
        expect.hasAssertions();

        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimb);

        // Act
        let result = await sut.filterReimbType(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should throw InternalServerError when filterByType is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.filterReimbType(1);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to an empty array when filterByType retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] }; }),
                release: jest.fn()
            };
        });

        // Act
        let result = await sut.filterReimbType(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);
    });

    test('should resolve to a Reimb object when filterByStatus retrieves records from data source', async () => {

        // Arrange
        expect.hasAssertions();

        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimb);

        // Act
        let result = await sut.filterReimbType(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should throw InternalServerError when filterByStatus is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.filterReimbStatus(1);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to an empty array when filterByStatus retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] }; }),
                release: jest.fn()
            };
        });

        // Act
        let result = await sut.filterReimbStatus(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);
    });

    test('should resolve to a Reimb object when addNew persists a record to the data source', async () => {
        // Arrange
        expect.hasAssertions();

        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimb);

        // Act
        let result = await sut.addNew(mockReimb);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Reimbursement).toBe(true);

    });

    test('should throw InternalServerError when addNew is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.addNew(mockReimb);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to an empty array when addNew persists a record to the data source', async () => {
        // Arrange
        expect.hasAssertions();
        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(true);

        // Act
        let result = await sut.addNew(mockReimb);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof Reimbursement).toBe(true);
    });

    test('should resolve to true when addNew updates a record on the data source', async () => {
        // Arrange
        expect.hasAssertions();

        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(true);

        // Act
        let result = await sut.update(mockReimb);

        // Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);
    });

    test('should throw InternalServerError when update is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.update(mockReimb);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to true when setReimbStatus approves record on the data source', async () => {
        // Arrange
        expect.hasAssertions();

        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(true);

        // Act
        let result = await sut.setReimbStatus(mockReimb);

        // Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);
    });

    test('should throw InternalServerError when setReimbStatus is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();

        let date = new Date();
        let mockReimb = new Reimbursement(1, 100, date, date, 'text', 1, 1, 1, 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.setReimbStatus(mockReimb);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });
});