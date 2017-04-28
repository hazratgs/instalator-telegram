module.exports = {
    event: 'home',
    children: {
        'Создать задание': {
            event: 'task:create',
            children: {
                '*': {
                    event: 'task:select',
                    children: {
                        'Лайк': {
                            event: 'task:select:type'
                        },
                        'Подписка': {
                            event: 'task:select:type'
                        },
                        'Лайк + Подписка': {
                            event: 'task:select:type',
                            children: {
                                '*': {
                                    event: 'task:select:source',
                                    children: {
                                        '*': {
                                            event: 'task:select:action',
                                            children: {
                                                '*': {
                                                    event: 'task:select:actionPerDay',
                                                    children: {
                                                        '*': {
                                                            event: 'task:select:like'
                                                        },
                                                        'Назад': {
                                                            event: 'location:back'
                                                        }
                                                    }
                                                },
                                                'Назад': {
                                                    event: 'location:back'
                                                }
                                            }
                                        },
                                        'Назад': {
                                            event: 'location:back'
                                        }
                                    }
                                },
                                'Назад': {
                                    event: 'location:back'
                                }
                            }
                        },
                        'Отписка': {
                            event: 'task:select:type',
                            children: {
                                '*': {
                                    event: 'task:select:type:unfollow',
                                    await: true
                                },
                                'Назад': {
                                    event: 'location:back'
                                }
                            }
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
                        },
                        'Назад': {
                            event: 'location:back'
                        }
                    }
                },
                'Назад': {
                    event: 'location:back'
                }
            }
        },
        // 'Активность': {
        //     event: '',
        //     children: {}
        // },
        'Аккаунты': {
            event: 'account:list',
            children: {
                '*': {
                    event: 'account:select',
                    children: {
                        'Удалить': {
                            event: 'account:delete',
                            await: true
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
                        },
                        'Назад': {
                            event: 'location:back'
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