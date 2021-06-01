const {Router} = require('express')
const {check, validationResult} = require('express-validator')
const config = require('config')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const router = Router() //создаем свой объект роутер  middleware
 
router.post('/register', 
[
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов').isLength({min:6})
], async (req,res)=>{ // в конечном счете будет обрабатываться запрос пост /api/auth/register функцией колбэком
 try {
    const errors = validationResult(req)

    if (!errors.isEmpty) {
        return res.status(400).json({
            errors:errors.array(),
            message: 'Некорректные данные регистрации'
        })
    }

    const {email,password} = req.body;

    const candidate = await User.findOne({email})

    if (candidate) {
        return res.status(400).json({message:"Такой пользователь уже существует"})
    }

    const hashedPassword = await bcryptjs.hash(password,12)

    const user = new User ({email, password: hashedPassword})

    await user.save()

    res.status(201).json({message:"Пользователь создан"})

 } catch (e) {
     res.status(500).json({message:"Что-то пошло не так..."})
 }
})

router.post('/login',[
    check('email','Введите корректный email').normalizeEmail().isEmail(),
    check('password','Введите пароль').exists()
], async (req,res)=>{ // в конечном счете будет обрабатываться запрос пост /api/auth/login функцией колбэком

    try {
        const errors = validationResult(req)
    
        if (!errors.isEmpty) {
            return res.status(400).json({
                errors:errors.array(),
                message: 'Некорректные данные авторизации'
            })
        }

        const {email,password} = req.body

        const user = await User.findOne({email})
    
        if (!user) {
            return res.status(400).json({message:'Пользователь не найден'})
        }
        const isMatch = await bcryptjs.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({message:'Введен неверный пароль'})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get('jwtSecret'),
            {expiresIn: '1h'}

        )
        res.json({token, userID:user.id}) // status(200) default


    
     } catch (e) {
         res.status(500).json({message:"Что-то пошло не так..."})
     }

})



module.exports = router;