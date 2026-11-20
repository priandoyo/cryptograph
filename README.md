
# Cryptograph

A lightweight cryptography workshop platform.

Students decrypt a message using Python and Google Colab,
then submit their answers through a web-based leaderboard.

## Repository

https://github.com/priandoyo/cryptograph

## Workshop Website

Deploy this repository using Vercel.

## Technology Stack

- Python
- AES-256-GCM
- Google Colab
- HTML
- JavaScript
- Node.js
- GitHub API
- JSON
- Vercel

## Project Structure

```text
cryptograph/
├── README.md
├── package.json
├── config.json
├── index.html
├── api.js
├── vercel.json
└── submissions.json
```

## Student Instructions

1. Open Google Colab.
2. Copy the Python decryption code provided by the instructor.
3. Enter the encryption key, nonce and ciphertext.
4. Execute the Python code.
5. Copy the decrypted message.
6. Visit the workshop website.
7. Enter your name and answer.
8. Check the live leaderboard.

## Instructor Instructions

### Configure the workshop

Edit config.json:

- workshop: Workshop name
- challenge: Challenge name
- max_submissions: Maximum submissions
- accept_submissions: Enable or disable submissions
- show_leaderboard: Show or hide leaderboard

### Reset the submission archive

Replace submissions.json with:

```json
{
  "submissions": []
}
```

### Close submissions

Change the configuration:

```json
"accept_submissions": false
```

## Deployment

1. Import this repository into Vercel.
2. Configure the required environment variables.
3. Deploy the application.

## Important

All submitted names and answers are publicly visible
because the submission archive is stored in this public
GitHub repository.

This project is intended for educational workshops,
not production use.
