// Карта действий
module.exports = {
    event: 'home',
    children: {
        'Создать задание': {
            event: 'task:create',
            children: {
                'febox': {
                    event: 'task:select'
                },
                'Назад': {
                    event: 'location:back'
                }
            }
        },
        'Активность': {
            event: '',
            children: {}
        },
        'Аккаунты': {
            event: 'account:list',
            children: {
                'Добавить': {
                    event: 'account:add',
                    children: {
                        '*': {
                            event: 'account:await'
                        }
                    }
                },
                'Назад': {
                    event: 'location:back'
                }
            }
        }
    }
};