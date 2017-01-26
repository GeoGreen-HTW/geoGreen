*** Settings ***
Library  Selenium2Library

***Variables***
${Page}  http://localhost:3000/
${BROWSER}  firefox
${validuser}  tester
${validpass}  testtest
${invaliduser}  i test
${invalidpass}  itest
${validmail}  tester@test.de
*** Test Cases ***
Valid login
	Given Open Firefox at GG
	When Sign in with valid user
	Then User is Logged in

Invalid login: wrong password
	Given Open Firefox at GG
	When Sign in with invalid password
	Then User is not signed in

Invalid login: wrong username
	Given Open Firefox at GG
	When Sign in with invalid username
	Then User is not signed in

***Keywords***
Open Firefox at GG
	Open Browser  ${Page}  ${BROWSER}
	Title should be  GeoGreen

Sign in with valid user
	Wait Until Page Contains Element  id=login-sign-in-link
	Click Link  id=login-sign-in-link
	Input Text  id=login-username-or-email  ${validuser}
	Input Text  id=login-password  ${validpass}
	Click Element  login-buttons-password
	Wait Until Page Contains Element  login-name-link

Sign in with invalid password
	Wait Until Page Contains Element  id=login-sign-in-link
	Click Link  id=login-sign-in-link
	Input Text  id=login-username-or-email  ${validuser}
	Input Text  id=login-password  ${invalidpass}
	Click Element  login-buttons-password
	Page Should Contain  password

User is not signed in
	Page Should Not Contain Element  login-name-link

Sign in with invalid username
	Wait Until Page Contains Element  id=login-sign-in-link
	Click Link  id=login-sign-in-link
	Input Text  id=login-username-or-email  ${invaliduser}
	Input Text  id=login-password  ${validpass}
	Click Element  login-buttons-password
	Page Should Contain  User not found

User is Logged in
	Element Should Contain  login-name-link  ${validuser}
