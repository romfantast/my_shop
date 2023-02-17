function authRedirect(req, res, connection, callback) {
  console.log(req.cookies);
  if (!req.cookies.id || !req.cookies.hash) {
    res.redirect("/login");
  }
  connection.query(
    `SELECT * FROM user WHERE id='${req.cookies.id}' and hash='${req.cookies.hash}'`,
    function (error, result) {
      if (error) throw error;
      console.log(result);
      if (!result.length) {
        console.log("error admin not found");
      } else {
        callback();
      }
    }
  );
}

module.exports = {
  authRedirect,
};
