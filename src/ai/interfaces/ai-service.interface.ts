import { TranscribeAudioDto } from '../dto/transcribe-audio.dto';
import { TextToSpeechDto } from '../dto/text-to-speech.dto';

export interface TranscribeAudioParams {
  userId: string;
  transcribeAudioDto: TranscribeAudioDto;
}

export interface TextToSpeechParams {
  userId: string;
  textToSpeechDto: TextToSpeechDto;
}
