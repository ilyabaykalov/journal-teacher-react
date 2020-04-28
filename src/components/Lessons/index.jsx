import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

import { AddLessonForm, host, Lesson } from '../../components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import './Lessons.scss';

library.add(fas);

const Lessons = ({ chapter, onEditTitle, onAddLesson, onRemoveLesson, onEditLesson, onCompleteLesson, withoutEmpty }) => {
	const editTitle = () => {
		Swal.fire({
			title: 'Введите заголовок главы',
			input: 'text',
			inputValue: chapter.name,
			showCancelButton: true,
			cancelButtonText: 'Отмена',
			confirmButtonColor: '#42B883',
			cancelButtonColor: '#C9D1D3',
			inputValidator: (value) => {
				if (!value) {
					return 'Поле не может быть пустым';
				}
			}
		}).then(({ value }) => {
			if (value) {
				onEditTitle(chapter.id, value);
				axios.patch(`http://${ host.ip }:${ host.port }/chapters/${ chapter.id }`, {
					name: value
				}).then(() => {
					console.debug(`Заголовок текущей главы изменён на ${ value }`);
				}).catch(error => {
					Swal.fire({
						icon: 'error',
						title: 'Не удалось обновить заголовок главы'
					}).then(() => {
						console.error('Не удалось обновить заголовок главы');
						console.error(`Ошибка: ${ error }`);
					});
				});
			}
		});
	};

	return (
		<div className='lessons'>
			<Link to={ `/chapters/${ chapter.id }` }>
				<div className='lessons__header'>
					<h2 className='lessons__header__title' style={ { color: chapter.color.hex } }>
						{ chapter.name }
					</h2>
					<FontAwesomeIcon className='lessons__header__chapter-name-edit-button'
					                 icon='pen'
					                 onClick={ editTitle }/>
				</div>
			</Link>

			<div className='lessons__items'>
				{ chapter.lessons &&
				chapter.lessons.map(lesson => (
					<Lesson
						key={ lesson.id }
						chapter={ chapter }
						onEdit={ onEditLesson }
						onRemove={ onRemoveLesson }
						onComplete={ onCompleteLesson }
						{ ...lesson }/>
				)) }
				<AddLessonForm key={ chapter.id } chapter={ chapter } onAddLesson={ onAddLesson }/>
				{ !withoutEmpty && chapter.lessons && !chapter.lessons.length && (
					<h2 className='no-lessons'>Уроки отсутствуют</h2>
				) }
			</div>
		</div>
	);
};

export default Lessons;
