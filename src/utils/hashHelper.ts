import bcrypt from "bcrypt";

// password hash function
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10; // তুমি চাইলে ENV থেকে নিতে পারো
    return await bcrypt.hash(password, saltRounds);
};

// password compare function
export const comparePassword = async (
    plainTextPassword: string,
    hashedPassword: string
): Promise<boolean> => {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
};
