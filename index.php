<!DOCTYPE html>
<!-- Coding By CodingNepal - youtube.com/codingnepal -->
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" type="text/css" href="./css/login.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
  <div class="center">
    <h1>Autostore Login</h1>

    <form onsubmit="submitLoginForm(event)">
      <div class="txt_field">
        <input type="text" name="username" required>
        <label id="username">Username</label>
      </div>
      <div class="txt_field">
        <input type="password" name="password" required>
        <label id="password">Password</label>
      </div>
      <div class="pass"></div>
      <input type="submit" value="Login">
      <div class="signup_link"></div>
    </form>
  </div>

</body>
<script src="./js/login.js"></script>
</html>
