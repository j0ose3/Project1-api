export class User {
    id: number;
    username: string;
    password: string;
    fname: string;
    lname: string;
    email: string;
    role: string;
    constructor(id: number, username: string, password: string, fn: string, ln: string, email: string, role: string ) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fname = fn;
        this.lname = ln;
        this.email = email;
        this.role = role;
    }
}