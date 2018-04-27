module.exports = {
  event: 'home',
  children: {
    'Создать задание': {
      event: 'task:create',
      children: {
        '*': {
          event: 'task:select',
          children: {
            'Лайк + Подписка': {
              event: 'task:select:follow+like',
              children: {
                Пользователь: {
                  event: 'task:select:follow+like:user',
                  children: {
                    '*': {
                      event: 'task:select:follow+like:user:select',
                      children: {
                        '*': {
                          event: 'task:select:follow+like:source:action',
                          children: {
                            '*': {
                              event: 'task:select:follow+like:source:actionPerDay',
                              children: {
                                '*': {
                                  event: 'task:select:follow+like:source:like'
                                }
                              }
                            },
                            Назад: {
                              event: 'location:back'
                            }
                          }
                        },
                        Назад: {
                          event: 'location:back'
                        }
                      }
                    },
                    Назад: {
                      event: 'location:back'
                    }
                  }
                },
                Хештег: {
                  event: 'task:select:follow+like:hashtag',
                  children: {
                    '*': {
                      event: 'task:select:follow+like:hashtag:find',
                      children: {
                        '*': {
                          event: 'task:select:follow+like:source:action',
                          children: {
                            '*': {
                              event: 'task:select:follow+like:source:actionPerDay',
                              children: {
                                '*': {
                                  event: 'task:select:follow+like:source:like'
                                }
                              }
                            },
                            Назад: {
                              event: 'location:back'
                            }
                          }
                        },
                        Назад: {
                          event: 'location:back'
                        }
                      }
                    }
                  }
                },
                Источники: {
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
                                Назад: {
                                  event: 'location:back'
                                }
                              }
                            },
                            Назад: {
                              event: 'location:back'
                            }
                          }
                        },
                        Назад: {
                          event: 'location:back'
                        }
                      }
                    },
                    Назад: {
                      event: 'location:back'
                    }
                  }
                },
                Назад: {
                  event: 'location:back'
                }
              }
            },
            Отписка: {
              event: 'task:select:type',
              children: {
                '*': {
                  event: 'task:select:type:unfollow'
                  // await: true
                },
                Назад: {
                  event: 'location:back'
                }
              }
            },
            Назад: {
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
            Назад: {
              event: 'location:back'
            }
          }
        },
        Назад: {
          event: 'location:back'
        }
      }
    },
    Активность: {
      event: 'actions',
      children: {
        '*': {
          event: 'actions:account',
          children: {
            Редактировать: {
              event: 'actions:account:update',
              children: {
                '*': {
                  event: 'actions:account:update:one',
                  children: {
                    '*': {
                      event: 'actions:account:update:two',
                      children: {
                        '*': {
                          event: 'actions:account:update:three'
                        }
                      }
                    }
                  }
                },
                Назад: {
                  event: 'location:back'
                }
              }
            },
            Отменить: {
              event: 'actions:account:cancel'
            },
            Назад: {
              event: 'location:back'
            }
          }
        },
        Назад: {
          event: 'location:back'
        }
      }
    },
    Аккаунты: {
      event: 'account:list',
      children: {
        '*': {
          event: 'account:select',
          children: {
            Редактировать: {
              event: 'account:edit',
              children: {
                '*': {
                  event: 'account:edit:await',
                  await: true
                },
                Назад: {
                  event: 'location:back'
                }
              }
            },
            Удалить: {
              event: 'account:delete',
              await: true
            },
            Назад: {
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
            Назад: {
              event: 'location:back'
            }
          }
        },
        Назад: {
          event: 'location:back'
        }
      }
    },
    Лимиты: {
      event: 'limit:message',
      children: {
        Назад: {
          event: 'location:back'
        }
      }
    }
  }
}
