##Author
Xavier Ondevilla

## Important directories
As I used express-generator and create-react-app, I had to modify some directories and files:

- sort-app/src/components
- api/bin/www
- api/routes/sorter.js
- db/sort-app.db

Anything outside these files and directories were not changed. There may be unused files.

## Assumptions
- Database has two tables: requests and sorting_steps.
  - Requests table has 2 columns: request_id (PRIMARY KEY) and timestamp
  - Sorting_steps has 5 columns: id (PRIMARY KEY), request_id (FOREIGN KEY constraint from requests table), step_no, description and array
- There are only 2 types of data to sort: integers and Strings
- If the user specifies string, numbers are allowed within the string, alongside special characters
- If the user specifies integer, only integers are allowed (no floats, doubles, etc.)
- If an error or invalid data is found server-side, a response code of 500 is sent (console.logged in node server)

##Sorting Algorithm
I used Quicksort algorithm as there is not that many items in the list (1 - 100 items)

##Important to Note
- Express, CORS and SQLite3 was used for the server side configuration
- Used CORS to avoid some errors
- You may need to change the port number to your liking, React is running on 3000 and api is running on 9000/sorter
