import { UserRepository } from '../repos/user-repo';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import { User } from '../models/user';
import { InternalServerError } from '../errors/errors';

/*
    We need to mock the connectionPool exported from the main module
    of our application. At this time, we only use one exposed method
    of the pg Pool API: connect. So we will provide a mock function 
    in its place so that we can mock it in our tests.
*/
jest.mock('..', () => {
    return {
        connectionPool: {
            connect: jest.fn()
        }
    };
});


// The result-set-mapper module also needs to be mocked
jest.mock('../util/result-set-mapper', () => {
    return {
        mapUserResultSet: jest.fn()
    };
});

describe('userRepo', () => {

    let sut = new UserRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() => {

        /*
            We can provide a successful retrieval as the default mock implementation
            since it is very verbose. We can provide alternative implementations for
            the query and release methods in specific tests if needed.
        */
        (mockConnect as jest.Mock).mockClear().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return {
                        rows: [
                            {
                                id: 1,
                                username: 'jangeles',
                                password: 'password',
                                fname: 'jose',
                                lname: 'angeles',
                                email: 'jangeles@revature.com',
                                role: 'admin'
                            }
                        ]
                    };
                }), 
                release: jest.fn()
            };
        });
        
        (mockMapper.mapUserResultSet as jest.Mock).mockClear();
    });

    test('should resolve to an array of Users when getAll retrieves records from data source', async () => {      
        // Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

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
        (mockConnect as jest.Mock).mockImplementation( () => {
            return {
                query: jest.fn().mockImplementation( () => { throw new Error(); }),
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

    test('should resolve to a User object when getById retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        // Act
        let result = await sut.getById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
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
        expect(result instanceof User).toBe(true);
    });

    test('should throw InternalServerError when getById() is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockConnect as jest.Mock).mockImplementation( () => {
            return {
                query: jest.fn().mockImplementation( () => { return false; }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.getById(mockUser.id);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to a User object when getUserByUniqueKey retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        // Act
        let result = await sut.getByUniqueKey('username', 'jangeles');

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
    });

    test('should resolve to an empty array when getUserByUniqueKey retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();
        
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] }; }), 
                release: jest.fn()
            };
        });

        // Act
        let result = await sut.getByUniqueKey('username', 'jangeles');

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);

    });

    test('should InternalServerError with no connection', async () => {
        // Arrange
        expect.hasAssertions();
        
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return null; }), 
                release: jest.fn()
            };
        });
        try{
        // Act
        let result = await sut.getByUniqueKey('username', 'jangeles');
        }
        catch(e){
        // Assert
        expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to a User object when getUserByCredentials retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        // Act
        let result = await sut.getUserByCredentials('username', 'jangeles');

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
    });

    test('should InternalServerError with no connection when calling getUserByCredentials', async () => {
        // Arrange
        expect.hasAssertions();
        
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return null; }), 
                release: jest.fn()
            };
        });
        try{
        // Act
        let result = await sut.getUserByCredentials('username', 'jangeles');
        }
        catch(e){
        // Assert
        expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to an empty array when getUserByCredentials retrieves a record from data source', async () => {
        // Arrange
        expect.hasAssertions();
        
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] }; }), 
                release: jest.fn()
            };
        });

        // Act
        let result = await sut.getUserByCredentials('username', 'jangeles');

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
    });

    test('should resolve to a User object when addNew persists a record to the data source', async () => {
        // Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        // Act
        let result = await sut.addNew(mockUser);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
    });

    test('should resolve to an empty array when addNew persists a record to the data source', async () => {

        // Arrange
        expect.hasAssertions();

        let mockUser = new User(6, 'test', 'password', 'test', 'test', 'ttest@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(true);

        // Act
        let result = await sut.addNew(mockUser);

        // Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
    });

    test('should InternalServerError with no connection when calling addNew', async () => {
        // Arrange
        expect.hasAssertions();
        let mockUser = new User(6, 'test', 'password', 'test', 'test', 'ttest@revature.com', 'admin');

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return null; }), 
                release: jest.fn()
            };
        });
        try{
        // Act
        await sut.addNew(mockUser);
        }
        catch(e){
        // Assert
        expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to true when update updates a record on the data source', async () => {

        // Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'jangeles', 'password', 'jose', 'angeles', 'jangeles@revature.com', 'admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(true);

        // Act
        let result = await sut.update(mockUser);

        // Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should InternalServerError with no connection', async () => {
        // Arrange
        expect.hasAssertions();
        let mockUser = new User(6, 'test', 'password', 'test', 'test', 'ttest@revature.com', 'admin');

        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return null; }), 
                release: jest.fn()
            };
        });
        try{
        // Act
        await sut.update(mockUser);
        }
        catch(e){
        // Assert
        expect(e instanceof InternalServerError).toBe(true);
        }
    });

    test('should resolve to true when deleteById deletes a record on the data source', async () => {
        // Arrange
        expect.hasAssertions();
        
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(true);

        // Act
        let result = await sut.deleteById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);
    });

    test('should throw InternalServerError when deleteById() is called but query is unsuccesful', async () => {
        // Arrange
        expect.hasAssertions();
        
        (mockConnect as jest.Mock).mockImplementation( () => {
            return {
                query: jest.fn().mockImplementation( () => { throw new Error(); }),
                release: jest.fn()
            };
        });

        // Act
        try {
            await sut.deleteById(1);
        } catch (e) {
            // Assert
            expect(e instanceof InternalServerError).toBe(true);
        }
    });
});