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
                            event: 'task:select:follow+like',
                            children: {
                                'Пользователь': {
                                    event: 'task:select:follow+like:user'
                                },
                                'Геолокация': {
                                    event: 'task:select:follow+like:geo'
                                },
                                'Хештэг': {
                                    event: 'task:select:follow+like:hashtag'
                                },
                                'Источники': {
                                    event: 'task:select:follow+like:source',
                                    children: {
                                        '*': {
                                            event: 'task:select:follow+like:source:select',
                                            children: {
                                                '*': {
                                                    event: 'task:select:follow+like:source:action',
                                                    children: {
                                                        '*': {
                                                            event: 'task:select:follow+like:source:actionPerDay',
                                                            children: {
                                                                '*': {
                                                                    event: 'task:select:follow+like:source:like'
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
                                    // await: true
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
                'Добавить аккаунт': {
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
        'Активность': {
            event: 'actions',
            children: {
                '*': {
                    event: 'actions:account',
                    children: {
                        'Редактировать': {
                            event: 'actions:account:update',
                            children: {
                                '*': {
                                    event: 'actions:account:update:one',
                                    await: true,
                                    children: {
                                        '*': {
                                            event: 'actions:account:update:two',
                                            await: true
                                        }
                                    }
                                },
                                'Назад': {
                                    event: 'location:back'
                                }
                            }
                        },
                        'Отменить': {
                            event: 'actions:account:cancel'
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
                'Добавить аккаунт': {
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