import jwt from 'jsonwebtoken'

const genToken = (user: any) => {
    const AccessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" })

    const RefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" })

    return { AccessToken, RefreshToken }
}

export default genToken