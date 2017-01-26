Quest.robot
*** Settings ***
Library  Selenium2Library

***Variables***
${Page}  http://localhost:3000/
${BROWSER}  firefox
${validuser}  tester
${validpass}  testtest
${validmail}  tester@test.de
*** Test Cases ***
Create Quest
	Given Open Firefox at GG
	And Sign in with valid user
	When Click on the Map
  And Provide Details
  And Save Quest
  Then Quest is Saved

Change Quest
	Given Open Firefox at GG
	And Sign in with valid user
	When click on existig quest
	And Change Details
	And save Changes
	Then Changes is saved

delete Quest
	Given Open Firefox at GG
	And Sign in with valid user
	When click on existig quest
	And quest was created by me
	And click on delete
	Then Quest is deleted

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

User is Logged in
	Element Should Contain  login-name-link  ${validuser}
