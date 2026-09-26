const API_URL = "http://localhost:5000/api";


const registerForm =
    document.getElementById("registerForm");

const role =
    document.getElementById("role");

const studentFields =
    document.getElementById("studentFields");

const facultyFields =
    document.getElementById("facultyFields");

const organizerFields =
    document.getElementById("organizerFields");

const message =
    document.getElementById("message");

const registerButton =
    document.getElementById("registerButton");



/*
------------------------------------
SHOW FIELDS BASED ON ROLE
------------------------------------
*/

role.addEventListener("change", () => {

    studentFields.classList.add("hidden");

    facultyFields.classList.add("hidden");

    organizerFields.classList.add("hidden");


    if (role.value === "STUDENT") {

        studentFields.classList.remove("hidden");

    }


    if (role.value === "FACULTY") {

        facultyFields.classList.remove("hidden");

    }


    if (role.value === "ORGANIZER") {

        organizerFields.classList.remove("hidden");

    }

});



/*
------------------------------------
SHOW MESSAGE
------------------------------------
*/

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message " + type;
}



/*
------------------------------------
REGISTER
------------------------------------
*/

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document.getElementById("name")
                .value.trim();


        const email =
            document.getElementById("email")
                .value.trim();


        const password =
            document.getElementById("password")
                .value;


        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;


        const selectedRole =
            role.value;



        /*
        -------------------------------
        BASIC VALIDATION
        -------------------------------
        */

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword ||
            !selectedRole
        ) {

            showMessage(
                "Please fill all required fields",
                "error"
            );

            return;
        }


        if (password.length < 5) {

            showMessage(
                "Password must contain at least 5 characters",
                "error"
            );

            return;
        }


        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match",
                "error"
            );

            return;
        }



        /*
        -------------------------------
        CREATE DATA OBJECT
        -------------------------------
        */

        const userData = {

            name: name,

            email: email,

            password: password,

            role: selectedRole
        };



        /*
        -------------------------------
        STUDENT DATA
        -------------------------------
        */

        if (selectedRole === "STUDENT") {

            userData.register_number =
                document.getElementById(
                    "registerNumber"
                ).value.trim();


            userData.department =
                document.getElementById(
                    "studentDepartment"
                ).value.trim();


            userData.year =
                document.getElementById(
                    "studentYear"
                ).value;


            if (
                !userData.register_number ||
                !userData.department ||
                !userData.year
            ) {

                showMessage(
                    "Please fill all student details",
                    "error"
                );

                return;
            }
        }



        /*
        -------------------------------
        FACULTY DATA
        -------------------------------
        */

        if (selectedRole === "FACULTY") {

            userData.department =
                document.getElementById(
                    "facultyDepartment"
                ).value.trim();


            userData.institution =
                document.getElementById(
                    "facultyInstitution"
                ).value.trim();


            if (
                !userData.department ||
                !userData.institution
            ) {

                showMessage(
                    "Please fill all faculty details",
                    "error"
                );

                return;
            }
        }



        /*
        -------------------------------
        ORGANIZER DATA
        -------------------------------
        */

        if (selectedRole === "ORGANIZER") {

            userData.organization_name =
                document.getElementById(
                    "organizationName"
                ).value.trim();


            userData.institution =
                document.getElementById(
                    "organizerInstitution"
                ).value.trim();


            if (
                !userData.organization_name ||
                !userData.institution
            ) {

                showMessage(
                    "Please fill all organizer details",
                    "error"
                );

                return;
            }
        }



        /*
        -------------------------------
        SEND TO BACKEND
        -------------------------------
        */

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating Account...";


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(userData)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Registration failed",
                    "error"
                );

                return;
            }


            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerForm.reset();


            studentFields.classList.add("hidden");

            facultyFields.classList.add("hidden");

            organizerFields.classList.add("hidden");


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1500);


        } catch (error) {

            console.error(error);

            showMessage(
                "Cannot connect to server. Make sure backend is running.",
                "error"
            );

        } finally {

            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";
        }

    }
);