import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkTradeName,
  isSimilarName,
  nameKeys,
  namingTips,
  normalizeLetters,
} from '../../oman/tradeNames';

const ids = (name: string) => checkTradeName(name).issues.map(i => `${i.id}:${i.level}`);

test('Arabic letter variants and the article normalise to the same key', () => {
  assert.equal(normalizeLetters('أحمد'), normalizeLetters('احمد'));
  assert.equal(nameKeys('القهوة المختصة').compact, nameKeys('قهوه مختصه').compact);
  assert.equal(nameKeys('ركن القهوة للتجارة ش.م.م').compact, nameKeys('ركن القهوة').compact);
  assert.equal(nameKeys('Al-Noor Trading LLC').compact, nameKeys('Noor').compact);
});

test('"Oman" is blocked as a word and flagged inside a word, but Romania is fine', () => {
  assert.deepEqual(ids('Oman Coffee'), ['oman:not_allowed']);
  assert.deepEqual(ids('القهوة العمانية'), ['oman:not_allowed']);
  assert.ok(ids('Omantech').includes('oman:risky'));
  assert.deepEqual(ids('Romania Cafe'), []);
});

test('religious and military words are blocked; first names like Sultan are only a risk', () => {
  assert.deepEqual(ids('مقهى الجيش'), ['meaning:not_allowed']);
  assert.deepEqual(ids('Islamic Books'), ['meaning:not_allowed']);
  assert.deepEqual(ids('مؤسسة سلطان للتجارة'), ['meaning:risky']);
  assert.deepEqual(ids('مؤسسة عبدالله للتجارة'), []);
});

test('well-known brands: same name blocked, containing or misspelling is a risk', () => {
  assert.deepEqual(ids('Starbucks'), ['similar:not_allowed']);
  assert.deepEqual(ids('ستاربكس'), ['similar:not_allowed']);
  assert.deepEqual(ids('Starbucks Nizwa'), ['similar:risky']);
  assert.deepEqual(ids('Starbuks'), ['similar:risky']);
  assert.deepEqual(ids('Bank Muscat Cafe'), ['similar:risky']);
  assert.deepEqual(ids('Muscat Bakery'), []);
});

test('a tribe name with آل is blocked', () => {
  assert.ok(ids('آل سعيد للتجارة').includes('proper:not_allowed'));
});

test('an ordinary name passes with no issues', () => {
  const r = checkTradeName('ركن القهوة المختصة');
  assert.equal(r.verdict, 'ok');
  assert.equal(checkTradeName('Specialty Coffee Corner').verdict, 'ok');
  assert.equal(checkTradeName('').verdict, 'ok');
});

test('similar-name matching for the YieldX check', () => {
  assert.equal(isSimilarName('ركن القهوة', 'ركن القهوه'), 'same');
  assert.equal(isSimilarName('Coffee Corner LLC', 'coffee corner'), 'same');
  assert.equal(isSimilarName('Desert Rose Cafe', 'Desert Rosa Cafe'), 'similar');
  assert.equal(isSimilarName('Desert Rose', 'Mountain View'), null);
});

test('naming tips are advice only', () => {
  const tips = namingTips('ركن القهوة المختصة').map(t => t.id);
  assert.ok(tips.includes('generic'));
  assert.ok(tips.includes('english'));
  assert.ok(namingTips('Specialty Coffee Corner').map(t => t.id).includes('arabic'));
});
