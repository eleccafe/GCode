import {describe,it,expect} from 'vitest';
import {parseChord,suggestChords,chordCandidates} from './parseChord';
import {chordName,chordNotes,noteName,notePc,prefersFlats,spellInterval,mod,INTERVALS,SHARPS,FLATS,isMinor} from './notes';
import {getRelatedChords,degreeOf,effectiveKey} from './related';
import type {Chord,Quality,KeyContext} from './types';
const ctx:KeyContext={tonic:'A',mode:'major',locked:false};
const parse=(s:string)=>{const c=parseChord(s);if('error'in c)throw Error(c.error);return c;};
describe('parser',()=>{
 it.each([['am','Am'],['A-','Am'],['Amin','Am'],['c♯7','C#7'],['b♭maj7','Bbmaj7'],[' CM7 ','Cmaj7'],['F#ø','F#m7b5'],['F#ø7','F#m7b5'],['f#min7b5','F#m7b5'],['d°','Ddim'],['C+','Caug'],['G / b','G/B'],['c / f♯','C/F#'],['A-7','Am7'],['AMIN7','Am7'],['Aminor','Am'],['Amajor','A'],['Amaj','A'],['dsus','Dsus4']])('%s normalizes to %s',(input,name)=>expect(chordName(parse(input))).toBe(name));
 it.each(['','Xyz','H','C13','C/B/G','Cblah','C##'])('rejects %s with three candidates',input=>{const c=parseChord(input);expect(c).toMatchObject({error:'알 수 없는 코드'});if('error'in c)expect(c.suggestions).toHaveLength(3);});
 it('roundtrips every supported spelling',()=>{for(const name of chordCandidates)expect(chordName(parse(name))).toBe(name);});
 it('ranks exact and near matches',()=>{expect(suggestChords('Am')[0]).toBe('Am');expect(suggestChords('Cma7')).toContain('Cmaj7');expect(suggestChords('')).toHaveLength(3);expect(suggestChords('C',6)).toHaveLength(6);});
});
describe('notes and intervals',()=>{
 it.each([['A',['A','C#','E']],['Am',['A','C','E']],['C#maj7',['C#','E#','G#','B#']],['Bbdim',['Bb','Db','Fb']],['Csus2',['C','D','G']],['Csus4',['C','F','G']],['Cadd9',['C','E','G','D']],['C6',['C','E','G','A']],['G/B',['G','B','D']],['C/D',['C','E','G','D']]])('%s is spelled correctly',(name,notes)=>expect(chordNotes(parse(name))).toEqual(notes));
 it('handles enharmonics and wraparound',()=>{expect(mod(-1)).toBe(11);expect(notePc('B#')).toBe(0);expect(notePc('Cb')).toBe(11);expect(notePc('Ebb')).toBe(2);expect(spellInterval('B',4,2)).toBe('D#');expect(spellInterval('F#',4,2)).toBe('A#');expect(noteName(13)).toBe('C#');expect(noteName(1,true)).toBe('Db');expect(noteName(1,false)).toBe('C#');expect(isMinor(parse('Am7'))).toBe(true);});
 it('selects a key signature',()=>{expect(prefersFlats('F')).toBe(true);expect(prefersFlats('A')).toBe(false);expect(prefersFlats('D',true)).toBe(true);expect(prefersFlats('A',true)).toBe(false);expect(prefersFlats('Bb',true)).toBe(true);});
 it('all chord spellings match their pitch intervals',()=>{for(const root of [...SHARPS,...FLATS])for(const quality of Object.keys(INTERVALS) as Quality[]){const chord={root,quality};expect(chordNotes(chord).map(notePc)).toEqual(INTERVALS[quality].map(i=>mod(notePc(root)+i)));}});
});
describe('related chords',()=>{
 it.each([['A',['D','E','F#m','Bm','C#m','G#dim']],['E',['A','B','C#m','F#m','G#m','D#dim']],['Bb',['Eb','F','Gm','Cm','Dm','Adim']],['Am',['Dm','Em','E','F','G','C','Bdim']]])('%s returns ordered diatonic chords',(input,expected)=>expect(getRelatedChords(parse(input),ctx)[0].chords.map(c=>c.name)).toEqual(expected));
 it('calculates substitutions from the key',()=>expect(getRelatedChords(parse('A'),ctx)[1].chords.map(c=>c.name)).toEqual(['E7','A7','C#7','G','Dm','F#m','Am']));
 it('supports minor relative and parallel keys',()=>expect(getRelatedChords(parse('Am'),ctx)[1].chords.map(c=>c.name)).toEqual(['E7','A7','C7','G','Dm','C','A']));
 it('honors a locked G key and excludes the current triad',()=>{const locked:KeyContext={tonic:'G',mode:'major',locked:true};expect(degreeOf(parse('A'),locked)).toBe('II');expect(getRelatedChords(parse('A'),locked)[0].chords.map(c=>c.name)).toEqual(['C','D','Em','Am','Bm','F#dim','G']);expect(effectiveKey(parse('A'),locked)).toEqual(locked);});
 it('labels chromatic and seventh degrees',()=>{expect(degreeOf(parse('G'),ctx)).toBe('♭VII');expect(degreeOf(parse('D#'),ctx)).toBe('♭V');expect(degreeOf(parse('G#dim'),ctx)).toBe('vii°');expect(degreeOf(parse('Bm7b5'),ctx)).toBe('iiø7');expect(degreeOf(parse('E7'),ctx)).toBe('V7');expect(degreeOf(parse('Amaj7'),ctx)).toBe('I7');});
 it('generates distinct supported results without mutating input',()=>{for(const root of SHARPS)for(const quality of Object.keys(INTERVALS) as Quality[])for(const mode of ['major','minor'] as const)for(const locked of [false,true]){
  const chord=Object.freeze({root,quality}),key=Object.freeze({tonic:'F#',mode,locked});
  for(const group of getRelatedChords(chord,key)){expect(group.chords.length).toBeLessThanOrEqual(8);expect(new Set(group.chords.map(c=>notePc(c.chord.root)+c.chord.quality)).size).toBe(group.chords.length);for(const c of group.chords){expect(c.degree).not.toContain('undefined');expect(c.chord).not.toEqual(chord);expect(INTERVALS[c.chord.quality]).toBeDefined();}}
 }});
 it('uses the main root for variations even in a locked key',()=>{const variations=getRelatedChords(parse('Bb7'),{tonic:'F',mode:'major',locked:true})[2].chords;expect(variations).toHaveLength(8);expect(variations.every(c=>c.chord.root==='Bb'&&c.chord.quality!=='7')).toBe(true);});
});
