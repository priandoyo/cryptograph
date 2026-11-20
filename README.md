# Cryptograph

**A Hands-on Cryptography and Software Engineering Workshop**

Cryptograph is a practical learning platform combining cryptography, programming, and software engineering.

Students decrypt messages using Python in Google Colab, submit their answers through a web application, and compete on a shared leaderboard.

- **Live application:** https://cryptograph-beryl.vercel.app/
- **Source code:** https://github.com/priandoyo/cryptograph

---

# 1. Cryptography Challenge

Your mission is to decrypt the following messages using the provided ciphertext, key, and nonce.

### Challenge 01

**Ciphertext**
\`\`\`text
e685c03fbf3cc7f3c7827e9d124d3b3964c462f476de2248c8f2f8800bd8dd97f9c6ad9dced6b034a565964c7c99af0d6b7beeda8257c1a976a0335a271b1eb624254af21522ad394ecebae0a2d95136644fdc8b50
\`\`\`

**Key**
\`\`\`text
9f8e8ef77e66840822c10bb0741ac9dbe170315dad1dc40af3f0dc7bc304f5a9
\`\`\`

**Nonce**
\`\`\`text
2080f71619090eaa84c63fcd
\`\`\`

### Challenge 02

**Ciphertext**
\`\`\`text
b124c9bd98dd8c1939bc5a0c9bd0efcb79f896a6faeba7284e64c456ff4c9596843083313e0dc0ab28a115b3286b9160ea5bacc269a9dc52fea1b933a4c90988360c7265418844aa205e5e57abf1878581aa59a5b4b4
\`\`\`

**Key**
\`\`\`text
1c8a4f979784400610bf703d6999c27f6e7677b9cba45f0d4b3b25995b64763e
\`\`\`

**Nonce**
\`\`\`text
85096cdaad1fc6b7ea9ebff0
\`\`\`

**Your mission:** Decrypt the messages, recover the plaintext, and submit your answers through the [Cryptograph application](https://cryptograph-beryl.vercel.app/).

---

# 2. Decryption with Python

Use [Google Colab](https://colab.research.google.com/) to execute the following code directly in your browser.

### Install and run

\`\`\`python
!pip install cryptography

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Challenge inputs
key_hex = "PASTE_KEY_HERE"
nonce_hex = "PASTE_NONCE_HERE"
ciphertext_hex = "PASTE_CIPHERTEXT_HERE"

# Convert hexadecimal into bytes
key = bytes.fromhex(key_hex)
nonce = bytes.fromhex(nonce_hex)
ciphertext = bytes.fromhex(ciphertext_hex)

# Decrypt
aesgcm = AESGCM(key)

try:
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    print(plaintext.decode("utf-8"))
except Exception as error:
    print("Decryption failed:", error)
\`\`\`

The encrypted data includes an authentication tag. The decryption process verifies this tag, so an incorrect key, nonce, or ciphertext causes authentication to fail.

---

# 3. Understanding Cryptography

The exercise uses symmetric authenticated encryption.

| Concept | Explanation |
|---|---|
| Plaintext | Original readable message |
| Ciphertext | Encrypted message |
| Key | Secret value used for encryption and decryption |
| Nonce | Additional value required by the encryption algorithm |
| Authentication tag | Verifies data integrity and authenticity |

The basic process:

\`\`\`text
       ENCRYPTION
  Plaintext + Key + Nonce
             |
             v
         Encryption
             |
             v
         Ciphertext

       DECRYPTION
  Ciphertext + Key + Nonce
             |
             v
         Decryption
             |
             v
          Plaintext
\`\`\`

The exercise uses GCM, which provides confidentiality and integrity/authenticity verification.

---

# 4. The Cryptograph Application

The web application allows students to submit their decrypted answers and view a shared leaderboard.

**Workshop flow:**

1. Instructor provides the challenge.
2. Students decrypt using Python.
3. Students submit their names and answers.
4. The application stores submissions.
5. The leaderboard refreshes periodically.
6. Instructor evaluates the answers.

The current application records submissions but does not automatically grade them.

---

# 5. Software Engineering Architecture

Cryptograph also demonstrates how a small web application is designed and deployed.

### Application architecture

\`\`\`text
             STUDENT / BROWSER
                    |
                   HTTPS
                    |
                    v
            VERCEL PLATFORM
             /          \\
            /            \\
       Frontend       Serverless API
      index.html         api.js
                           |
                           | GitHub API
                           v
                    GITHUB REPOSITORY
                    config.json
                    submissions.json
\`\`\`

### Technology stack

| Component | Technology | Purpose |
|---|---|---|
| Cryptography | Python | Decrypt messages |
| Development environment | Google Colab | Execute Python |
| Frontend | HTML, CSS, JavaScript | User interface |
| Backend | Node.js | Process API requests |
| Hosting | Vercel | Deploy application |
| Data format | JSON | Store configuration and submissions |
| Persistence | GitHub Contents API | Read and update data |
| Version control | Git and GitHub | Manage source code |

### Repository structure

\`\`\`text
cryptograph/
├── README.md
├── package.json
├── config.json
├── index.html
├── api.js
├── vercel.json
└── submissions.json
\`\`\`

### Data configuration

The \`config.json\` file controls the workshop:

\`\`\`json
{
  "workshop": "Cryptography Workshop",
  "challenge": "Challenge 01",
  "max_submissions": 20,
  "accept_submissions": true,
  "show_leaderboard": true
}
\`\`\`

Student submissions are stored in \`submissions.json\`. The application uses GitHub as file-based persistence rather than a traditional database.

### Deployment

\`\`\`text
 Developer
    |
    v
  GitHub
    |
    v
  Vercel
    |
    v
 Live Application
\`\`\`

The backend uses a GitHub Personal Access Token configured as the Vercel environment variable \`GITHUB_TOKEN\`. Never expose this token in frontend code or commit it to the repository.

To start a new workshop, archive previous results if needed, reset \`submissions.json\` to an empty submissions array, and update \`config.json\`.

---

# 6. Software Engineering Learning Points

The project provides practical examples of:

- **Architecture:** Frontend, backend, APIs, and serverless computing.
- **Programming:** Python versus JavaScript.
- **API design:** HTTP GET and POST requests.
- **Data management:** JSON, file-based persistence, and databases.
- **Security:** Cryptographic keys, secrets, and input validation.
- **DevOps:** Git, GitHub, deployment, and configuration management.
- **Reliability:** Error handling and concurrent submissions.

The current implementation is an educational demonstration. Its public repository exposes stored student names and answers, and its single-file persistence approach has concurrency limitations. It is not intended for confidential data or production workloads.

---

# Project Philosophy

> Learn cryptography by solving a problem. Learn programming by writing the code. Learn software engineering by understanding the system.

Cryptograph connects cryptography, Python programming, web development, data management, and cloud deployment in one practical workshop.


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
