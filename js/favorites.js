import { GithubUser } from "./github.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@githubfavorites')) || []
    }

    save() {
        localStorage.setItem('@githubfavorites', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login == username)

            if (userExists) {
                throw new Error('Usuário já existe')
            }
            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('Usuário não localizado')
            }

            this.entries = [user, ...this.entries]
            this.save()
            this.update()
        } catch (error) {
            alert(error.message)
        }
    }

    delete(username) {
        const filterUser = this.entries
            .filter(user => user.login !== username.login)
        this.entries = filterUser
        this.save()
        this.deleteTr()
        this.update()
    }
}

export class FavoritesView extends Favorites {

    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector('tbody')
        this.update()
        this.onadd()
    }

    onadd() {
        const btnFav = this.root.querySelector('.search-favorite button')
        btnFav.onclick = () => {
            const input = this.root.querySelector('input')
            if (input.value == '') {
                alert('Preencha o campo para pesquisar')
                return
            }
            this.add(input.value)
        }
    }

    update() {
        const entrie = this.entries.length === 0

        if (entrie) {
            const img = this.showEmptyImage()
            this.tbody.append(img)
        } else {
            this.deleteTr()
            this.entries.forEach(user => {
                const row = this.createRow()
                row.querySelector('.user img').src = `https://github.com/${user.login}.png`
                row.querySelector('.user img').alt = `Imagem de perfil da rede social Github do usuário ${user.name}`
                row.querySelector('.user a').href = `https://github.com/${user.login}`
                row.querySelector('.user p').textContent = user.name
                row.querySelector('.user span').textContent = user.login
                row.querySelector('.repositories').textContent = user.public_repos
                row.querySelector('.followers').textContent = user.followers

                row.querySelector('.remove').onclick = () => {
                    const isOk = confirm('Deseja remover?')

                    if (isOk) {
                        this.delete(user)
                    }

                }

                this.tbody.append(row)
            })
        }

    }

    createRow() {
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/flavioaugusto1.png" alt="">
                <a href="https://github.com/flavioaugusto1" target="_blank">
                    <p>Flávio Augusto</p>
                    <span>/flavioaugusto1</span>
                </a>
            </td>
            <td class="repositories">5</td>
            <td class="followers">5</td>
            <td><button class="remove">Remover</button></td>
        `
        return tr
    }

    showEmptyImage() {
        const img = document.createElement('tr')
        img.classList.add('empty-favorites')
        img.innerHTML = `
                <td>
                    <img src="./assets/Estrela.svg" alt="Imagem de uma estela cinza onde ela aparenta estar supresa">
                    <span>Nenhum favorito ainda</span>
                </td>
        `

        return img
    }

    deleteTr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            });
    }

}