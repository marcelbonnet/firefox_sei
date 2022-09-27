// placeholder caso queira adicionar itens na página do SEI

// descaga o design que quebrou o preenchimento automático de senha no SEI 4:
let pwdSenha = document.getElementById('pwdSenha')
if ( pwdSenha !== null ){
	let span = document.createElement('span')
	span.innerHTML = "<strong>Você pode voltar a usar a senha salva pelo navegador.<strong>"
	document.getElementById('divUsuario').append(span)

	let pwd = document.querySelector('input[type="password"')
	pwd.addEventListener('change', function(event){
		pwdSenha.value = pwd.value
		pwdSenha.dispatchEvent(new Event('change'));
	})
}