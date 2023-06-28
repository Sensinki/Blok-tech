/* eslint-disable space-before-function-paren */
// VALIDATION
const form = document.querySelector('.sign-up')

form.addEventListener('submit', (event) => {
    // Prevent the default form submission behavior
    event.preventDefault()

    if (validatePassword()) {
        // If the validation passes, user can proceed with form submission
        form.submit()
    }
})

const validatePassword = () => {
    const passwordInput = document.getElementById('password')
    const { value: password } = passwordInput

    // Check password requirements
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const isMinimumLength = password.length >= 5

    if (!hasUppercase || !hasNumber || !isMinimumLength) {
        // If password does not meet the requirements
        alert('Password must contain at least 1 uppercase letter, 1 number, and be minimum 5 characters long.')
        // Don't allow submission
        return false
    }

    // Allow submission
    return true
}
