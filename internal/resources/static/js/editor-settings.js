// Editor Settings Module
// Handles the account settings dialog for editors (password change)

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const dialog = document.querySelector('.user-settings-dialog');
        if (!dialog) return;

        const closeBtn = dialog.querySelector('.close-dialog');
        const cancelBtns = dialog.querySelectorAll('.cancel-editor-settings');
        const form = document.getElementById('editorSettingsForm');
        const errorMsg = dialog.querySelector('.error-message');
        const usernameInput = document.getElementById('editorSettingsUsername');
        const roleInput = document.getElementById('editorSettingsRole');
        const currentPasswordInput = document.getElementById('editorSettingsCurrentPassword');
        const newPasswordInput = document.getElementById('editorSettingsNewPassword');
        const confirmPasswordInput = document.getElementById('editorSettingsConfirmPassword');

        function hide() {
            dialog.classList.remove('active');
            form.reset();
            errorMsg.style.display = 'none';
        }

        closeBtn.addEventListener('click', hide);

        cancelBtns.forEach(function(btn) {
            btn.addEventListener('click', hide);
        });

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            errorMsg.style.display = 'none';

            var newPassword = newPasswordInput.value;
            var confirmPassword = confirmPasswordInput.value;

            if (newPassword !== confirmPassword) {
                errorMsg.textContent = window.i18n ? window.i18n.t('editor_settings.password_mismatch') : 'Passwords do not match';
                errorMsg.style.display = 'block';
                return;
            }

            if (!newPassword) {
                errorMsg.textContent = window.i18n ? window.i18n.t('editor_settings.password_required') : 'New password is required';
                errorMsg.style.display = 'block';
                return;
            }

            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = window.i18n ? window.i18n.t('common.sending') : 'Sending...';

            try {
                var response = await fetch('/api/password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        current_password: currentPasswordInput.value,
                        new_password: newPassword
                    })
                });

                if (response.ok) {
                    hide();
                    var msg = window.i18n ? window.i18n.t('editor_settings.password_changed') : 'Password changed successfully';
                    window.DialogSystem.showMessageDialog(
                        window.i18n ? window.i18n.t('common.settings') : 'Settings',
                        msg
                    );
                    if (window.Auth && window.Auth.checkDefaultPassword) {
                        window.Auth.checkDefaultPassword();
                    }
                } else {
                    var data = await response.json().catch(function() { return {}; });
                    errorMsg.textContent = data.message || (window.i18n ? window.i18n.t('editor_settings.password_error') : 'Failed to change password');
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error('Error changing password:', err);
                errorMsg.textContent = window.i18n ? window.i18n.t('common.unknown_error') : 'An error occurred';
                errorMsg.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });

        function show(username, role) {
            usernameInput.value = username || '';
            roleInput.value = role || '';
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            errorMsg.style.display = 'none';
            dialog.classList.add('active');
            setTimeout(function() {
                currentPasswordInput.focus();
            }, 100);
        }

        window.EditorSettings = { show: show, hide: hide };
    });
})();
