const nodemailer = require("nodemailer");
exports.sendmail = function (req, res, user) {
    const pageurl = req.protocol + '://' + req.get('host') + '/create/' + user._id
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "abdullahmoid786@gmail.com",
            pass: "xikncesjcjdljvyf",
        },
    });

    const mailOptions = {
        from: "Abdullah Pvt. Ltd.<abdullahmoid786@gmail.com>",
        to: req.body.email,
        subject: req.body.subject,
        text: req.body.body,
        html: `<a href=${pageurl}>Password Reset Link</a>`,
    };

    transport.sendMail(mailOptions, (err, info) => {
        if (err) return res.send(err);
        console.log(info);
        user.passwordResetToken = 1;
        user.save()
        return res.send(
            "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        );
    });
};
