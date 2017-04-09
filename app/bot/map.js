// Карта действий
module.exports = {
    event: 'home',
    children: {
        'Создать задание': {
            event: 'task:create',
            children: {
                '*': {
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
                '*': {
                    event: 'account:select',
                    children: {
                        'Добавить задание': {
                            event: 'location:back'
                        },
                        'Активность': {
                            event: 'location:back'
                        },
                        'Редактировать': {
                            event: 'location:back'
                        },
                        'Удалить': {
                            event: 'location:back'
                        },
                        'Назад': {
                            event: 'location:back'
                        }
                    }
                },
                'Добавить': {
                    event: 'account:add',
                    children: {
                        '*': {
                            event: 'account:await',
                            await: true
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