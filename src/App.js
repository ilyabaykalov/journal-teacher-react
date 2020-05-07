import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Route, useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { AddChapterButton, Chapter, host, Lessons } from './components';

library.add(fas);

function App() {
	const [chapters, updateChapters] = useState(null);
	const [colors, setColors] = useState(null);
	const [activeItem, setActiveItem] = useState(null);
	let history = useHistory();

	useEffect(() => {
		axios.get(`http://${ host.ip }:${ host.port }/chapters`).then(({ data }) => {
			updateChapters(data);
		}).then(() => {
			console.debug(`Главы успешно получены с сервера`);
		}).catch(error => {
			console.error('Не удалось получить главы с сервера');
			console.error(`Ошибка: ${ error }`);
			alert('Не удалось получить главы с сервера');
		});

		axios.get(`http://${ host.ip }:${ host.port }/colors`).then(({ data }) => {
			setColors(data);
		}).then(() => {
			console.debug(`Палитра цветов успешно получены с сервера`);
		}).catch(() => {
			console.error('Не удалось получить палитру цветов с сервера');
			alert('Не удалось получить палитру цветов с сервера');
		});
	}, []);

	useEffect(() => {
		const chapterId = Number(history.location.pathname.replace('/chapters/', ''));
		if (chapters) {
			const chapter = chapters.find(chapter => chapter.id === chapterId);
			setActiveItem(chapter);
		}
	}, [chapters, history.location.pathname]);

	/* chapter events */
	const onAddChapter = chapter => {
		const newChapter = [...chapters, chapter];
		updateChapters(newChapter);
	};

	const onEditChapterTitle = (id, title) => {
		const newChapter = chapters.map(item => {
			if (item.id === id) {
				item.name = title;
			}
			return item;
		});
		updateChapters(newChapter);
	};

	/* lesson events */
	const onAddLesson = (chapterId, newLesson) => {
		const newChapter = chapters.map(item => {
			if (item.id === chapterId) {
				item.lessons = [...item.lessons, newLesson];
			}
			return item;
		});
		updateChapters(newChapter);
	};

	const onEditLesson = (chapterId, updLesson, setHomeworkIconColor, setLessonCheckClassNames) => {
		Swal.fire({
			title: 'Введите данные урока',
			html:
				`<label for='lessonTitle'>Название урока</label>
					<input id='lessonTitle' class='swal2-input' value='${ updLesson.title }'>
				<label for='homework'>Домашнее задание</label>
					<textarea id='homework' class='swal2-textarea' oninput='this.value ?  document.getElementsByClassName("homework")[0].classList.remove("hidden") : document.getElementsByClassName("homework")[0].classList.add("hidden")' placeholder='Нет задания'>${ !updLesson.homework ? '' : updLesson.homework }</textarea>
				<div class='mark-container'>
					<div class='lesson'>
						<label for='lessonMark'>Оценка за урок</label>
						<select id='lessonMark' class='swal2-select'>
							<option value='none' ${ updLesson.lessonMark ? 'selected' : '' }>Нет оценки</option>
							<option value='2' ${ updLesson.lessonMark === 2 ? 'selected' : '' }>2</option>
							<option value='3' ${ updLesson.lessonMark === 3 ? 'selected' : '' }>3</option>
							<option value='4' ${ updLesson.lessonMark === 4 ? 'selected' : '' }>4</option>
							<option value='5' ${ updLesson.lessonMark === 5 ? 'selected' : '' }>5</option>
						</select>
					</div>
					<div class='${ !updLesson.homework ? 'homework hidden' : 'homework' }'>
						<label for='homeworkMark'>Оценка за домашнее задание</label>
						<select id='homeworkMark' class='swal2-select'>
							<option value='none' ${ updLesson.homeworkMark ? 'selected' : '' }>Нет оценки</option>
							<option value='2' ${ updLesson.homeworkMark === 2 ? 'selected' : '' }>2</option>
							<option value='3' ${ updLesson.homeworkMark === 3 ? 'selected' : '' }>3</option>
							<option value='4' ${ updLesson.homeworkMark === 4 ? 'selected' : '' }>4</option>
							<option value='5' ${ updLesson.homeworkMark === 5 ? 'selected' : '' }>5</option>
						</select>
					</div>
				</div>`,
			showCloseButton: true,
			showCancelButton: true,
			focusConfirm: false,
			confirmButtonText: 'Сохранить',
			cancelButtonText: 'Отмена',
			confirmButtonColor: '#42B883',
			cancelButtonColor: '#C9D1D3',
			preConfirm: function () {
				const title = document.getElementById('lessonTitle').value;
				const homework = document.getElementById('homework').value;
				const lessonMark = +document.getElementById('lessonMark').value;
				const homeworkMark = +document.getElementById('homeworkMark').value;
				return {
					title: title === '' ? updLesson.title : title,
					homework: homework === '' ? null : homework,
					completed: updLesson.completed,
					lessonMark: !isNaN(lessonMark) ? lessonMark : null,
					homeworkMark: !isNaN(homeworkMark) ? homeworkMark : null
				};
			}
		}).then(({ value, dismiss }) => {
			if (value) {
				if (value.title) {
					return [chapters.map(chapter => {
						if (chapter.id === chapterId) {
							chapter.lessons = chapter.lessons.map(lesson => {
								if (lesson.id === updLesson.id) {
									lesson.title = value.title;
									lesson.homework = value.homework;
									lesson.completed = value.completed;
									lesson.lessonMark = value.lessonMark;
									lesson.homeworkMark = value.homework ? value.homeworkMark : null;
								}
								return lesson;
							});
						}
						return chapter;
					}), value];
				}
			} else return [null, dismiss];
		}).then(([newChapters, value]) => {
			if (newChapters && value) {
				if (value.title) {
					axios.patch(`http://${ host.ip }:${ host.port }/lessons/${ updLesson.id }`, {
						title: value.title,
						homework: value.homework,
						completed: value.completed,
						lessonMark: value.lessonMark,
						homeworkMark: value.homeworkMark
					}).then(() => {
						updateChapters(newChapters);
						setLessonCheckClassNames(!value.lessonMark ? '' : value.lessonMark >= 4 ? 'good' : 'bad');
						setHomeworkIconColor(!value.homeworkMark ? 'homework-icon' : value.homeworkMark >= 4 ? 'homework-icon good' : 'homework-icon bad');
					}).catch(error => {
						Swal.fire({
							icon: 'error',
							title: 'Не удалось изменить данные урока'
						}).then(() => {
							console.error('Не удалось изменить данные урока');
							console.error(`Ошибка: ${ error }`);
						});
					});
				}
			}
		});
	};

	const onRemoveLesson = (chapterId, lessonId) => {
		let lessonName = '';
		chapters.forEach(chapter => {
			if (chapter.id === chapterId) {
				chapter.lessons = chapter.lessons.map(lesson => {
					if (lesson.id === lessonId) {
						lessonName = lesson.title;
					}
					return lesson;
				});
			}
			return chapter;
		});
		Swal.fire({
			title: `Вы уверены что хотите удалить задачу\n'${ lessonName }'?`,
			icon: 'question',
			confirmButtonColor: '#42B883',
			cancelButtonColor: '#C9D1D3',
			confirmButtonText: 'Да, удалить!',
			showCancelButton: true,
			cancelButtonText: 'Отмена'
		}).then(result => {
			if (result.value) {
				const newChapter = chapters.map(item => {
					if (item.id === chapterId) {
						item.lessons = item.lessons.filter(lesson => lesson.id !== lessonId);
					}
					return item;
				});
				updateChapters(newChapter);
				axios.delete(`http://${ host.ip }:${ host.port }/lessons/${ lessonId }`).then(() => {
					console.debug(`Задача '${ lessonName }' успешно удалена`);
				}).catch(error => {
					Swal.fire({
						icon: 'error',
						title: 'Не удалось удалить список'
					}).then(() => {
						console.error('Не удалось удалить список');
						console.error(`Ошибка: ${ error }`);
					});
				});
			}
		});
	};

	const onCompleteLesson = (chapterId, lessonId, completed) => {
		let newLesson = {};
		const newChapter = chapters.map(chapter => {
			if (chapter.id === chapterId) {
				chapter.lessons = chapter.lessons.map(lesson => {
					if (lesson.id === lessonId) {
						lesson.completed = completed;
						newLesson = lesson;
					}
					return lesson;
				});
			}
			return chapter;
		});

		axios.patch(`http://${ host.ip }:${ host.port }/lessons/${ lessonId }`, {
			title: newLesson.title,
			homework: newLesson.homework,
			completed: newLesson.completed,
			lessonMark: newLesson.lessonMark,
			homeworkMark: newLesson.homeworkMark
		}).then(() => {
			updateChapters(newChapter);
		}).catch(error => {
			console.error('Не удалось обновить задачу');
			console.error(`Ошибка: ${ error }`);
			alert('Не удалось обновить задачу');
		});
	};

	return (
		<div className='todo'>
			<div className='todo__sidebar'>
				<Chapter onClickItem={ () => {
					history.push(`/`);
				} } items={ [{
					active: history.location.pathname === '/',
					icon: 'list',
					name: 'Все главы'
				}] }/>
				{ chapters ? (
					<Chapter items={ chapters }
					         onRemove={ id => {
						         const newChapters = chapters.filter(item => item.id !== id);
						         setActiveItem(chapters.find(item => item.id === id));
						         updateChapters(newChapters);
					         } }
					         onClickItem={ chapter => {
						         history.push(`/chapters/${ chapter.id }`);
					         } }
					         activeItem={ activeItem }
					         isRemovable/>
				) : (
					<div className='loading'>
						<FontAwesomeIcon className={ 'icon fa-spin' }
						                 icon='spinner'/>
						<p>Загрузка...</p>
					</div>
				) }
				<AddChapterButton colors={ colors }
				                  onAdd={ onAddChapter }/>
			</div>
			<div className='todo__lessons'>
				<Route exact path='/'>
					{ chapters && chapters.map(chapter => (
						<Lessons key={ chapter.id }
						         chapter={ chapter }
						         onAddLesson={ onAddLesson }
						         onEditTitle={ onEditChapterTitle }
						         onRemoveLesson={ onRemoveLesson }
						         onEditLesson={ onEditLesson }
						         onCompleteLesson={ onCompleteLesson }
						         withoutEmpty/>
					)) }
				</Route>
				<Route path='/chapters/:id'>
					{ chapters && activeItem && (
						<Lessons
							chapter={ activeItem }
							onAddLesson={ onAddLesson }
							onEditTitle={ onEditChapterTitle }
							onRemoveLesson={ onRemoveLesson }
							onEditLesson={ onEditLesson }
							onCompleteLesson={ onCompleteLesson }/>
					) }
				</Route>
			</div>
		</div>
	);
}

export default App;
