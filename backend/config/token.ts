import jwt from 'jsonwebtoken'

const genToken = (user: any) => {
    const roleName = user.role && typeof user.role === 'object' && 'name' in user.role ? user.role.name : 'CUSTOMER';
    const permissions = user.role && typeof user.role === 'object' && Array.isArray(user.role.permissions)
        ? user.role.permissions.map((p: any) => typeof p === 'object' && p !== null && 'name' in p ? p.name : p)
        : [];

    const AccessToken = jwt.sign(
        { 
            userId: user._id,
            role: roleName,
            permissions: permissions 
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: "7d" }
    );

    const RefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" })

    return { AccessToken, RefreshToken }
}

export default genToken