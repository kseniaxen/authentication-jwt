jQuery(
    $ => {
        $(document).ready(() => {
            clearResponse()
            if (getCookie('jwt') !== '') {
                showLoggedInMenu()
            } else {
                showLoggedOutMenu()
            }
        })

        showLoggedOutMenu = () => {
            $('#login', '#sign_up').show()
            $('#logout, #update_account, #home').hide()
        }

        showLoggedInMenu = () => {
            $('#home, #update_account, #logout').show()
            $('#login, #sign_up').hide()
        }

        $('#logout').on('click', () => {
            window.location.reload();
            setCookie('jwt', '', 1)
            showLoggedOutMenu()
        })

        //Form Registr
        $(document).on("click", "#sign_up", () => {
            let html = `
                <h2>Регистрация</h2>
                <form id="sign_up_form">
                    <div class="form_group">
                        <label for="firstname">Имя</label>
                        <input type="text" class="form-control" name="firstname" id="firstname" required />
                    </div>

                    <div class="form_group">
                        <label for="lastname">Фамилия</label>
                        <input type="text" class="form-control" name="lastname" id="lastname" required />
                    </div>

                    <div class="form_group">
                        <label for="email">Email</label>
                        <input type="text" class="form-control" name="email" id="email" required />
                    </div>

                    <div class="form_group">
                        <label for="password">Пароль</label>
                        <input type="text" class="form-control" name="password" id="password" required />
                    </div>

                    <button type="submit" class="btn btn-primary my-2">Зарегистрироваться</button>
                </form>
            `;

            clearResponse()
            $('#content').html(html)
        })

        $(document).on('submit', '#sign_up_form', (e) => {
            const sign_up_form = $('#sign_up_form')
            const data = new FormData(e.target);
            const form_data = JSON.stringify(Object.fromEntries(data.entries()))
            $.ajax({
                url: '/php-course/authentication-jwt/api/create_user.php',
                type: 'POST',
                contentType: 'application/json',
                data: form_data,
                success: result => {
                    showLoginPage()
                    $('#response').html(`
                    <div class="alert alert-success" role="alert">
                        Регистрация завершена успешно. Пожалуйста, войдите
                    </div`
                    )
                    sign_up_form.find('input').val('')
                },
                error: (xhr, resp, text) => {
                    $("#response").html(`
                    <div class="alert alert-danger" role="alert">
                        Невозможно зарегистрироваться. Пожалуйста, свяжитесь с администратором
                    </div>`);
                }
            })
            return false;
        })

        $(document).on('click', '#login', () => {
            showLoginPage()
        })

        showLoginPage = () => {
            //Delete jwt
            setCookie('jwt', '', 1)

            let html = `
            <h2>Вход</h2>
            <form id="login_form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" id="email" name="email" placeholder="Введите email"/>
                </div>

                <div class="form_group">
                    <label for="password">Пароль</label>
                    <input type="password" class="form-control" id="password" name="password" placeholder="Введите пароль"/>
                </div>

                <button type="submit" class="btn btn-primary my-2">Войти</button>
            </form>
            `
            $("#content").html(html);
            clearResponse();
            showLoggedOutMenu();
        }

        clearResponse = () => {
            $('#response').html('');
        }

        setCookie = (cname, cvalue, exdays) => {
            let d = new Date()
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
            let expires = 'expires=' + d.toUTCString()
            document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
        }

        $(document).on('submit', '#login_form', (e) => {
            const login_form = $('#sign_up_form')
            const data = new FormData(e.target);
            const form_data = JSON.stringify(Object.fromEntries(data.entries()))

            $.ajax({
                url: '/php-course/authentication-jwt/api/login.php',
                type: 'POST',
                contentType: 'application/json',
                data: form_data,
                success: result => {
                    setCookie('jwt', result.jwt, 1)
                    $('#home, #update_account, #logout').show()
                    showHomePage()
                    $('#response').html(`
                    <div class='alert alert-success'>
                        Успешный вход в систему.
                    </div>
                    `)
                },
                error: (xhr, resp, text) => {
                    $("#response").html(`
                    <div class='alert alert-danger'>
                        Ошибка входа. Email или пароль указан неверно.
                    </div>`);
                    login_form.find("input").val("");
                }
            })
            return false
        })

        $(document).on('click', '#home', () => {
            showHomePage()
            clearResponse()
        })

        showHomePage = () => {
            const jwt = getCookie('jwt')

            $.post('/php-course/authentication-jwt/api/validate_token.php', JSON.stringify({ jwt: jwt })).done(result => {
                let html = `
                <div class="card">
                    <div class="card-header">Добро пожаловать!</div>
                    <div class="card-body">
                        <h5 class="card-title">Вы вошли в систему</h5>
                        <p class="card-text">Вы не сможете получить доступ к домашней странице и страницам учетной записи, если вы не вошли в систему</p>
                    </div>
                </div>
                `

                $("#content").html(html);
                showLoggedInMenu();
            }).fail(result => {
                showLoginPage();
                $("#response").html(`
                    <div class='alert alert-danger'>
                        Пожалуйста войдите, чтобы получить доступ к домашней станице
                    </div>`
                )
            })
        }

        getCookie = (cname) => {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == " ") {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        showUpdateAccountForm = () => {
            const jwt = getCookie('jwt')

            $.post("/php-course/authentication-jwt/api/validate_token.php", JSON.stringify({ jwt: jwt })).done(result => {
                let html = `
                <h2>Обновление аккаунта</h2>
                <form id="update_account_form">
                    <div class="form-group">
                        <label for="firstname">Имя</label>
                        <input type="text" class="form-control" name="firstname" id="firstname" required value="${result.data.firstname}"/>
                    </div>
                    
                    <div class="form-group">
                        <label for="lastname">Фамилия</label>
                        <input type="text" class="form-control" name="lastname" id="lastname" required value="${result.data.lastname}" />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" class="form-control" name="email" id="email" required value="${result.data.email}" />
                    </div>

                    <div class="form-group">
                        <label for="password">Пароль</label>
                        <input type="password" class="form-control" name="password" id="password" required/>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        Сохранить
                    </button>
                </form>
                `;

                clearResponse()
                $('#content').html(html)
            }).fail(result => {
                showLoginPage()
                $("#response").html("<div class='alert alert-danger'>Пожалуйста, войдите, чтобы получить доступ к странице учетной записи</div>");
            })
        }

        $(document).on('click', '#update_account', () => {
            showUpdateAccountForm()
        })

        $(document).on('submit', '#update_account_form', (e) => {
            e.preventDefault()
            const update_account_form = $('#update_account_form')

            const jwt = getCookie('jwt')

            const data = new FormData(e.target);
            let form_data = Object.fromEntries(data.entries())
            form_data = { ...form_data, jwt: jwt }
            form_data = JSON.stringify(form_data)

            $.ajax({
                url: '/php-course/authentication-jwt/api/update_user.php',
                type: 'POST',
                contentType: 'application/json',
                data: form_data,
                success: result => {
                    $("#response").html("<div class='alert alert-success'>Учетная запись обновлена</div>")
                    setCookie("jwt", result.jwt, 1)
                }, error: (xhr, resp, text) => {
                    if (xhr.responseJSON.message == "Невозможно обновить пользователя") {
                        $("#response").html(`<div class='alert alert-danger'>${xhr.responseJSON.message}</div>`);
                    } else if (xhr.responseJSON.message == "Доступ закрыт") {
                        showLoginPage();
                        $("#response").html(`<div class='alert alert-danger'>${xhr.responseJSON.message}</div>`);
                    }
                }
            })
        })
    }
)