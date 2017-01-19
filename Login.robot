*** Settings ***
Library  Selenium2Library

***Variables***
${Page}  http://141.45.92.211:3000/
${BROWSER}  firefox
${validuser}  tester
${validpass}  testtest
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
	When Sign in with invalid password
	Then User is not signed in

***Keywords***
Open Firefox at GG
	Open Browser  ${Page}  ${BROWSER}
	Title should be  geogreen

Sign in with valid user
	Wait Until Page Contains Element  id=login-sign-in-link
	Click Link  id=login-sign-in-link
	Input Text  id=login-username-or-email  ${validuser}
	Input Text  id=login-password  ${validpass}
	Click Element  login-buttons-password
	Wait Until Page Contains Element  login-name-link

User is Logged in
	Element Should Contain  login-name-link  ${validuser}
