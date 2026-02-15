---
name: angular-frontend
description: Padrões técnicos e de UI para o Frontend (Angular 17+) no projeto CECOR
---

# Angular Frontend Skill - CECOR

Este guia define os padrões de interface e desenvolvimento para o frontend usando Angular e Material Design.

## 1. Design System (Material Design)

- **Componentes**: Utilize sempre @angular/material para botões, tabelas, inputs e diálogos.
- **Consistência**: Mantenha o padrão de cores e espaçamento definido no tema global.
- **Tabelas**: Use `mat-table` com `MatSort` e `MatPaginator` para listagens complexas.

## 2. Formulários (Reactive Forms)

- **Estratégia**: Use `FormGroup` e `FormBuilder`.
- **Complexidade**: Para formulários longos (como cadastro de aluno), utilize o `mat-stepper` para dividir em etapas lógicas.
- **Dinamicidade**: Use `FormArray` para listas dinâmicas (ex: responsáveis, contatos adicionais).
- **Validação**: Implemente validadores personalizados para CPF, CEP e telefones.

## 3. Serviços e APIs

- **Modelos**: Mantenha as interfaces TypeScript sincronizadas com as structs do Go no backend (localizadas em `frontend/src/app/core/models`).
- **Data Formatting**: Datas devem ser formatadas como ISO (`YYYY-MM-DD`) no momento do envio para a API.
- **Locale**: O projeto está configurado para `pt-BR`. Utilize o seletor de data e pipes de moeda de acordo com este locale.

## 4. UX e Feedback

- **Loading**: Exiba estados de carregamento ou spinners durante chamadas assíncronas.
- **Snackbars**: Use `MatSnackBar` para confirmar sucessos ou exibir mensagens de erro vindas do backend.
