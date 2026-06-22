import jwt from 'jsonwebtoken'

const genToken = (user: any) => {
    // Safely extract permissions name or ID, fallback to empty array if role or permissions are not populated
    const permissions = user.role && user.role.permissions 
        ? user.role.permissions.map((p: any) => p.name || p) 
        : [];

    const AccessToken = jwt.sign(
        { 
            userId: user._id, 
            role: user.role ? (user.role.name || user.role) : undefined,
            permissions 
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: "15m" }
    )

    const RefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" })

    return { AccessToken, RefreshToken }
}

export default genToken